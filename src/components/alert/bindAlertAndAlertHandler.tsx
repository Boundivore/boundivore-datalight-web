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
import { Modal, Form, Select } from 'antd';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import useCurrentCluster from '@/hooks/useCurrentCluster';
const action = 'ALERT_MAIL';
const BindAlertAndAlertHandler: FC = ({ handlerId, isModalOpen, handleCancel }) => {
	const [form] = Form.useForm();
	const { clusterComponent, selectCluster } = useCurrentCluster();
	const [alertList, setAlertList] = useState([]);
	const bindAction = () => {
		form.validateFields().then(async ({ AlertId }) => {
			const api = APIConfig.bindAlertAndAlertHandler;
			const params = {
				HandlerId: [
					{
						AlertHandlerTypeEnum: action,
						AlertId,
						HandlerId: handlerId,
						IsBinding: true
					}
				]
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
	};
	useEffect(() => {
		selectCluster && getAlertList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectCluster]);
	return (
		<Modal open={isModalOpen} onCancel={handleCancel} onOk={bindAction}>
			{clusterComponent}
			<Form form={form}>
				<Form.Item name="AlertId">
					<Select
						style={{ width: 120 }}
						allowClear
						options={alertList}
						fieldNames={{ label: 'AlertRuleName', value: 'AlertRuleId' }}
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};
export default BindAlertAndAlertHandler;
