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
 * 告警规则列表
 * @author Tracy
 */
import { FC, useState, useEffect } from 'react';
import { t } from 'i18next';
import { Table, Flex, Space, Button, App, message, Badge, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import useCurrentCluster from '@/hooks/useCurrentCluster';
import { AlertSimpleVo, AlertHandlerVo } from '@/api/interface';
import useNavigater from '@/hooks/useNavigater';

const AlertRuleList: FC = () => {
	const [alertList, setAlertList] = useState<AlertSimpleVo[]>([]);
	const { clusterComponent, selectCluster } = useCurrentCluster();
	const { navigateToCreateAlert, navigateToAlertDetail } = useNavigater();
	const { modal } = App.useApp();
	const [messageApi, contextHolder] = message.useMessage();
	// 顶部操作按钮配置
	const buttonConfigTop = [
		{
			id: 1,
			label: t('alert.addAlert'),
			callback: () => {
				navigateToCreateAlert(selectCluster);
			},
			disabled: false
		}
	];
	// 单条操作按钮配置
	const buttonConfigItem = (text: string, record: AlertSimpleVo) => {
		const { Enabled, AlertRuleId } = record;
		return [
			{
				id: 1,
				label: t('detail'),
				callback: () => {
					navigateToAlertDetail(AlertRuleId);
				},
				disabled: false
			},
			{
				id: 2,
				label: Enabled ? t('disable') : t('enable'),
				callback: () => switchEnabled(Enabled, AlertRuleId),
				disabled: false
			},
			{
				id: 3,
				label: t('edit'),
				callback: () => {
					navigateToAlertDetail(AlertRuleId);
				},
				disabled: false
			},
			{
				id: 4,
				label: t('alert.removeAlert'),
				callback: () => removeAlert(AlertRuleId),
				disabled: false
			}
		];
	};

	const columns: TableColumnsType<AlertSimpleVo> = [
		{
			title: t('alert.alertRuleName'),
			dataIndex: 'AlertRuleName',
			key: 'AlertRuleName'
		},
		{
			title: t('isEnable'),
			dataIndex: 'Enabled',
			key: 'Enabled',
			render: text => <Badge status={text ? 'success' : 'error'} text={text ? t(`enabled`) : t(`disabled`)} />
		},
		{
			title: t('alert.alertHandlerType'),
			dataIndex: 'AlertHandlerList',
			key: 'AlertHandlerList',
			width: '20%',
			render: (text: []) => (
				<Flex wrap="wrap" gap="small">
					{text.map((handler: AlertHandlerVo) => (
						<Tag key={handler.AlertHandlerType} bordered={false} color="processing">
							{t(`alert.${handler.AlertHandlerType}`)}
						</Tag>
					))}
				</Flex>
			)
		},
		{
			title: t('operation'),
			key: 'IsExistInitProcedure',
			dataIndex: 'IsExistInitProcedure',
			width: '40%',
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
	const switchEnabled = (enabled: boolean, alertId: string | number) => {
		modal.confirm({
			title: enabled ? t('disable') : t('enable'),
			content: t('operationServiceConfirm', { operation: enabled ? t('disable') : t('enable') }),
			okText: t('confirm'),
			cancelText: t('cancel'),
			onOk: async () => {
				const api = APIConfig.switchAlertEnabled;
				const params = {
					AlertSwitchEnabledList: [
						{
							Enabled: !enabled,
							AlertId: alertId
						}
					],
					ClusterId: selectCluster
				};
				const { Code } = await RequestHttp.post(api, params);
				if (Code === '00000') {
					messageApi.success(t('messageSuccess'));
					getAlertList(); //删除成功更新列表
				}
			}
		});
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
					getAlertList(); //删除成功更新列表
				}
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
			<Table rowKey="AlertRuleId" dataSource={alertList} columns={columns}></Table>
		</>
	);
};
export default AlertRuleList;
