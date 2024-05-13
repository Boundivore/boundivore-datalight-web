/**
 * Copyright (C) <2023> <Boundivore> <boundivore@foxmail.com>
 * <p>
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the Apache License, Version 2.0
 * as published by the Apache Software Foundation.
 * <p>
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * Apache License, Version 2.0 for more details.
 * <p>
 * You should have received a copy of the Apache License, Version 2.0
 * along with this program; if not, you can obtain a copy at
 * http://www.apache.org/licenses/LICENSE-2.0.
 */

/**
 * 新增告警邮箱处理方式
 * @author Tracy
 */
import { FC, useState, useEffect } from 'react';
import _ from 'lodash';
import { Modal, Form, Transfer, Space } from 'antd';
import type { TransferProps } from 'antd';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import useCurrentCluster from '@/hooks/useCurrentCluster';
import { AlertIdAndTypeVo } from '@/api/interface';
interface BindAlertAndAlertHandlerProps {
	type: string;
	handlerId: string;
	isModalOpen: boolean;
	handleCancel: () => void;
}
const BindAlertAndAlertHandler: FC<BindAlertAndAlertHandlerProps> = ({ type, handlerId, isModalOpen, handleCancel }) => {
	const [form] = Form.useForm();
	const { clusterComponent, selectCluster } = useCurrentCluster();
	const [targetKeys, setTargetKeys] = useState<TransferProps['targetKeys']>();
	const [selectedKeys, setSelectedKeys] = useState<TransferProps['targetKeys']>([]);
	const [alertList, setAlertList] = useState<AlertIdAndTypeVo[]>([]);
	const [bindedAlertList, setBindedAlertList] = useState<AlertIdAndTypeVo[]>([]);
	const [hasBinded, setHasBinded] = useState(false);
	const bindAction = () => {
		form.validateFields().then(async ({ AlertId }) => {
			const api = APIConfig.bindAlertAndAlertHandler;
			const result = _.differenceWith(AlertId, bindedAlertList, (item1, item2: AlertIdAndTypeVo) => item1 === item2.AlertRuleId);
			const handlerIds = result.map(id => {
				return {
					AlertHandlerTypeEnum: type,
					AlertId: id,
					HandlerId: handlerId,
					IsBinding: true
				};
			});
			const params = {
				HandlerId: handlerIds
			};
			const { Code } = await RequestHttp.post(api, params);
			if (Code === '00000') {
				handleCancel && handleCancel();
			}
		});
	};
	const getAlertList = async () => {
		const api = APIConfig.getAlertSimpleList;
		const params = {
			ClusterId: selectCluster
		};
		const {
			Data: { AlertSimpleList }
		} = await RequestHttp.get(api, { params });
		setAlertList(AlertSimpleList);
		setHasBinded(true);
	};
	const getBindingAlert = async () => {
		const api = APIConfig.getBindingAlertHandlerByHandlerId;
		const params = { HandlerId: handlerId };
		const {
			Data: { AlertIdAndTypeList }
		} = await RequestHttp.get(api, { params });
		if (AlertIdAndTypeList) {
			const bindedList = AlertIdAndTypeList.filter((item: AlertIdAndTypeVo) => item.AlertHandlerType === type).map(
				(alert: AlertIdAndTypeVo) => ({
					AlertRuleId: alert.AlertId,
					AlertRuleName: alert.AlertName,
					disabled: true
				})
			);
			const keys = bindedList?.map((alert: AlertIdAndTypeVo) => alert.AlertRuleId);

			setTargetKeys(keys);
			setBindedAlertList(bindedList);
			setAlertList([...alertList, ...bindedList]);
		}
	};
	useEffect(() => {
		hasBinded && getBindingAlert();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hasBinded]);
	useEffect(() => {
		selectCluster && getAlertList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectCluster]);
	const onChange: TransferProps['onChange'] = nextTargetKeys => {
		setTargetKeys(nextTargetKeys);
	};
	const onSelectChange: TransferProps['onSelectChange'] = (sourceSelectedKeys, targetSelectedKeys) => {
		setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
	};
	const filterOption = (inputValue: string, option: AlertIdAndTypeVo) => option.AlertRuleName.indexOf(inputValue) > -1;

	return (
		<Modal open={isModalOpen} onCancel={handleCancel} onOk={bindAction} title="绑定告警规则">
			<Space direction="vertical">
				{clusterComponent}
				<Form form={form}>
					<Form.Item name="AlertId" label="告警配置">
						<Transfer
							dataSource={alertList}
							showSearch
							filterOption={filterOption}
							titles={['未选择', '已选择']}
							rowKey={record => record.AlertRuleId}
							targetKeys={targetKeys}
							selectedKeys={selectedKeys}
							onChange={onChange}
							onSelectChange={onSelectChange}
							// onScroll={onScroll}
							render={item => <div className="data-light-role">{item.AlertRuleName}</div>}
							// oneWay
						/>
					</Form.Item>
				</Form>
			</Space>
		</Modal>
	);
};
export default BindAlertAndAlertHandler;
