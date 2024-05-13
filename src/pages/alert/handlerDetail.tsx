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
 * 告警规则详情和编辑
 * @author Tracy
 */
import { Key, FC, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { t } from 'i18next';
import { Row, Col, Card, List, Typography, Badge, Space, Table, App, message, Button } from 'antd';
import type { TableColumnsType } from 'antd';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import ContainerCard from '@/components/containerCard';
import useNavigater from '@/hooks/useNavigater';
const { Text } = Typography;

const HandlerDetail: FC = () => {
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const type = searchParams.get('type') || '';
	const { navigateToAlertList } = useNavigater();
	const [handlerInfoData, setHandlerInfoData] = useState([]);
	const [tableData, setTableData] = useState([]);
	const [selectedAlert, setSelectedAlert] = useState<Key[]>([]);
	const { modal } = App.useApp();
	const [messageApi, contextHolder] = message.useMessage();
	const buttonConfigItem = (_text: [], record) => {
		const { AlertId } = record;
		return [
			{
				id: 1,
				label: t('detach'),
				callback: () => detach([AlertId]),
				disabled: false
			}
		];
	};
	const getHandlerDetail = async () => {
		let api = '';
		type === 'ALERT_INTERFACE' && (api = APIConfig.getAlertHandlerInterfaceDetailsById);
		type === 'ALERT_MAIL' && (api = APIConfig.getAlertHandlerMailDetailsById);
		const params = {
			HandlerId: id
		};
		const {
			Data: { HandlerId }
		} = await RequestHttp.get(api, { params });
		// console.log(data);
		const handlerInfo = [
			{
				key: 1,
				label: <Text strong>{t('permission.roleName')}</Text>,
				text: <span>{HandlerId}</span>
			}
			// {
			// 	key: 3,
			// 	label: <Text strong>{t('permission.roleType')}</Text>,
			// 	text: <span>{t(`permission.${Data.RoleType}`)}</span>
			// },
		];
		setHandlerInfoData(handlerInfo);
	};
	const detach = async alertIdList => {
		modal.confirm({
			title: t('detach'),
			content: t('detachConfirm'),
			okText: t('confirm'),
			cancelText: t('cancel'),
			onOk: async () => {
				const api = APIConfig.bindAlertAndAlertHandler;
				const idList = alertIdList.map(alertId => ({
					AlertHandlerTypeEnum: type,
					AlertId: alertId,
					HandlerId: id,
					IsBinding: false
				}));
				const params = {
					HandlerId: idList
				};
				const { Code } = await RequestHttp.post(api, params);
				if (Code === '00000') {
					messageApi.success(t('messageSuccess'));
					// callback && callback(); //操作成功更新列表
				}
			}
		});
	};
	const getAlertList = async () => {
		const api = APIConfig.getBindingAlertHandlerByHandlerId;
		const {
			Data: { AlertIdAndTypeList }
		} = await RequestHttp.get(api, { params: { HandlerId: id } });
		setTableData(AlertIdAndTypeList);
	};
	useEffect(() => {
		id && getHandlerDetail();
		id && getAlertList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);
	const columns: TableColumnsType = [
		{
			title: t('alert.alertName'),
			dataIndex: 'AlertName',
			key: 'AlertName'
		},
		{
			title: t('isEnable'),
			dataIndex: 'Enabled',
			key: 'Enabled',
			render: text => <Badge status={text ? 'success' : 'error'} text={text ? t(`enabled`) : t(`disabled`)} />
		},
		{
			title: t('operation'),
			key: 'operation',
			dataIndex: 'operation',
			render: (text, record) => {
				return (
					<Space>
						{buttonConfigItem(text, record).map(button => (
							<Button key={button.id} type="primary" size="small" ghost disabled={button.disabled} onClick={button.callback}>
								{button.label}
							</Button>
						))}
					</Space>
				);
			}
		}
		// {
		// 	title: t('alert.alertHandlerType'),
		// 	dataIndex: 'AlertHandlerList',
		// 	key: 'AlertHandlerList',
		// 	width: '20%',
		// 	// render: text => {
		// 	// 	text.map(handler => {
		// 	// 		return (
		// 	// 			<Tag key={handler.AlertHandlerType} color="processing">
		// 	// 				{handler.AlertHandlerType}
		// 	// 			</Tag>
		// 	// 		);
		// 	// 	});
		// 	// },
		// 	render: (text: []) => (
		// 		<Flex wrap="wrap" gap="small">
		// 			{text.map(handler => (
		// 				<Tag key={handler.AlertHandlerType} bordered={false} color="processing">
		// 					{t(`alert.${handler.AlertHandlerType}`)}
		// 				</Tag>
		// 			))}
		// 		</Flex>
		// 	)
		// }
	];
	const rowSelection = {
		onChange: (selectedRowKeys: Key[]) => {
			setSelectedAlert(selectedRowKeys);
		}
	};
	return (
		<ContainerCard>
			{contextHolder}
			<Row gutter={24} className="mt-[20px]">
				<Col span={6}>
					<Card className="data-light-card" title="告警配置信息">
						<List
							size="large"
							dataSource={handlerInfoData}
							renderItem={item => (
								<List.Item>
									{item.label}: {item.text}
								</List.Item>
							)}
						/>
					</Card>
				</Col>
				<Col span={18}>
					<Space direction="vertical" size="middle" style={{ display: 'flex' }}>
						<Card
							title="绑定告警信息"
							extra={
								<Space>
									<Button type="primary" disabled={!selectedAlert.length} onClick={() => detach(selectedAlert)}>
										{t('batchDetach')}
									</Button>
									<Button onClick={() => navigateToAlertList('handler', type)}>{t('back')}</Button>
								</Space>
							}
						>
							<Table
								rowSelection={{
									...rowSelection
								}}
								dataSource={tableData}
								columns={columns}
								rowKey="AlertId"
							></Table>
						</Card>
					</Space>
				</Col>
			</Row>
		</ContainerCard>
	);
};
export default HandlerDetail;
