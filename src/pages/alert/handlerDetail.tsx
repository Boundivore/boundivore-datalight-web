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
import { Row, Col, Card, List, Typography, Space, Table, App, message, Button } from 'antd';
import type { TableColumnsType } from 'antd';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import ContainerCard from '@/components/containerCard';
import useNavigater from '@/hooks/useNavigater';
import { AlertIdAndTypeVo } from '@/api/interface';
const { Text } = Typography;

const ALERT_INTERFACE = 'ALERT_INTERFACE';
const ALERT_MAIL = 'ALERT_MAIL';
interface HandlerInfoItem {
	key: number;
	label: React.ReactNode;
	text: React.ReactNode;
}
const HandlerDetail: FC = () => {
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const type = searchParams.get('type') || '';
	const { navigateToAlertList } = useNavigater();
	const [handlerInfoData, setHandlerInfoData] = useState<HandlerInfoItem[]>([]);
	const [tableData, setTableData] = useState([]);
	const [selectedAlert, setSelectedAlert] = useState<Key[]>([]);
	const { modal } = App.useApp();
	const [messageApi, contextHolder] = message.useMessage();
	const buttonConfigItem = (record: AlertIdAndTypeVo) => {
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
		type === ALERT_INTERFACE && (api = APIConfig.getAlertHandlerInterfaceDetailsById);
		type === ALERT_MAIL && (api = APIConfig.getAlertHandlerMailDetailsById);
		const params = {
			HandlerId: id
		};
		const { Data } = await RequestHttp.get(api, { params });
		const handlerInfo: HandlerInfoItem[] = [
			{
				key: 1,
				label: <Text strong>{t('id')}</Text>,
				text: <span>{Data.HandlerId}</span>
			},
			{
				key: 2,
				label: (
					<Text strong>{type === ALERT_INTERFACE ? t('alert.interfaceUri') : type === ALERT_MAIL && t('alert.mailAccount')}</Text>
				),
				text: (
					<Text
						ellipsis={{ tooltip: type === ALERT_INTERFACE ? Data.InterfaceUri : type === ALERT_MAIL && Data.MailAccount }}
						className="w-[150px]"
					>
						{type === ALERT_INTERFACE ? Data.InterfaceUri : type === ALERT_MAIL && Data.MailAccount}
					</Text>
				)
			}
		];
		setHandlerInfoData(handlerInfo);
	};
	const detach = async (alertIdList: Key[]) => {
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
	const columns: TableColumnsType<AlertIdAndTypeVo> = [
		{
			title: t('alert.alertRuleName'),
			dataIndex: 'AlertName',
			key: 'AlertName'
		},
		{
			title: t('operation'),
			key: 'operation',
			dataIndex: 'operation',
			render: (_text, record) => {
				return (
					<Space>
						{buttonConfigItem(record).map(button => (
							<Button key={button.id} type="primary" size="small" ghost disabled={button.disabled} onClick={button.callback}>
								{button.label}
							</Button>
						))}
					</Space>
				);
			}
		}
	];
	const rowSelection = {
		onChange: (selectedRowKeys: Key[]) => {
			setSelectedAlert(selectedRowKeys);
		},
		selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE]
	};
	return (
		<ContainerCard>
			{contextHolder}
			<Row gutter={24} className="mt-[20px]">
				<Col span={6}>
					<Card className="data-light-card" title={t('alert.alertHandler')}>
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
							<h4>{t('totalItems', { total: tableData.length, selected: selectedAlert.length })}</h4>
							<Table
								rowSelection={{
									...rowSelection
								}}
								dataSource={tableData}
								columns={columns}
								rowKey="AlertId"
								pagination={{
									showSizeChanger: true,
									total: tableData.length,
									showTotal: total => t('totalItems', { total, selected: selectedAlert.length })
								}}
							></Table>
						</Card>
					</Space>
				</Col>
			</Row>
		</ContainerCard>
	);
};
export default HandlerDetail;
