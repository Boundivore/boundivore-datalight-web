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
 * 告警邮箱处理方式列表
 * @author Tracy
 */
import { FC, useState, useEffect } from 'react';
import { t } from 'i18next';
import { Table, Flex, Space, Button, App, message, Badge } from 'antd';
import type { TableColumnsType } from 'antd';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import useCurrentCluster from '@/hooks/useCurrentCluster';
import { AlertSimpleVo } from '@/api/interface';
import AddHandlerMailModal from './addHandlerMailModal';
import BindAlertAndAlertHandler from './bindAlertAndAlertHandler';
// import useNavigater from '@/hooks/useNavigater';

const AlertHandlerMailList: FC = () => {
	const [alertList, setAlertList] = useState<AlertSimpleVo[]>([]);
	const { clusterComponent, selectCluster } = useCurrentCluster();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isBindModalOpen, setIsBindModalOpen] = useState(false);
	const [currentHandlerId, setCurrentHandlerId] = useState('');
	// const { navigateToCreateAlert } = useNavigater();
	const { modal } = App.useApp();
	const [messageApi, contextHolder] = message.useMessage();
	// 顶部操作按钮配置
	const buttonConfigTop = [
		{
			id: 1,
			label: t('alert.addHandlerMail'),
			callback: () => {
				// navigateToCreateAlert(selectCluster);
				addHandlerMail();
			},
			disabled: false
		}
	];
	// 单条操作按钮配置
	const buttonConfigItem = (text: string, record: AlertSimpleVo) => {
		const { HandlerId } = record;
		return [
			{
				id: 1,
				label: t('detail'),
				callback: () => {},
				disabled: false
			},
			{
				id: 2,
				label: t('bind'),
				callback: () => bindAlertAndAlertHandler(HandlerId),
				disabled: false
			},
			{
				id: 3,
				label: t('alert.remove'),
				callback: () => removeAlert(HandlerId),
				disabled: false
			}
		];
	};

	const columns: TableColumnsType<AlertSimpleVo> = [
		{
			title: t('alert.mailAccount'),
			dataIndex: 'MailAccount',
			key: 'MailAccount'
		},
		{
			title: t('isEnable'),
			dataIndex: 'Enabled',
			key: 'Enabled',
			render: text => <Badge status={text ? 'success' : 'error'} text={text ? t(`enabled`) : t(`disabled`)} />
		},
		{
			title: t('operation'),
			key: 'IsExistInitProcedure',
			dataIndex: 'IsExistInitProcedure',
			render: (text, record) => (
				<Space>
					{buttonConfigItem(text, record).map(button => (
						<Button key={button.id} type="primary" size="small" ghost disabled={button.disabled} onClick={button.callback}>
							{button.label}
						</Button>
					))}
				</Space>
			)
		}
	];
	const addHandlerMail = () => {
		setIsModalOpen(true);
	};
	const handleCancel = () => setIsModalOpen(false);
	const handleBindCancel = () => setIsBindModalOpen(false);
	const bindAlertAndAlertHandler = handlerId => {
		setIsBindModalOpen(true);
		setCurrentHandlerId(handlerId);
	};
	const removeAlert = (alertId: string | number) => {
		modal.confirm({
			title: t('alert.removeAlert'),
			content: t('alert.removeAlertConfirm'),
			okText: t('confirm'),
			cancelText: t('cancel'),
			onOk: async () => {
				const api = APIConfig.removeAlertRule;
				const params = {
					AlertIdList: [alertId],
					ClusterId: selectCluster
				};
				const { Code } = await RequestHttp.post(api, params);
				if (Code === '00000') {
					messageApi.success(t('messageSuccess'));
					getAlertHandlerMailList(); //删除成功更新列表
				}
			}
		});
	};
	const getAlertHandlerMailList = async () => {
		const api = APIConfig.getAlertHandlerMailList;
		const {
			Data: { AlertHandlerMailList }
		} = await RequestHttp.get(api);
		setAlertList(AlertHandlerMailList);
	};
	useEffect(() => {
		selectCluster && getAlertHandlerMailList();
	}, [selectCluster]);
	return (
		<>
			{contextHolder}
			<Flex justify="space-between">
				<Space>
					{buttonConfigTop.map(button => (
						<Button key={button.id} type="primary" disabled={button.disabled} onClick={button.callback}>
							{button.label}
						</Button>
					))}
				</Space>
				<Space>{clusterComponent}</Space>
			</Flex>
			<Table dataSource={alertList} columns={columns}></Table>
			<AddHandlerMailModal isModalOpen={isModalOpen} handleCancel={handleCancel} />
			<BindAlertAndAlertHandler handlerId={currentHandlerId} isModalOpen={isBindModalOpen} handleCancel={handleBindCancel} />
		</>
	);
};
export default AlertHandlerMailList;
