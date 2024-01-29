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
 * 组件管理列表页
 * @author Tracy.Guo
 */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Table, Button, Card, Space, App, message, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';

const { Text } = Typography;
const ComponentManage: React.FC = () => {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const serviceName = searchParams.get('name');
	const [loading, setLoading] = useState(false);
	const [tableData, setTableData] = useState([]);
	const [selectComponent, setSelectComponent] = useState([]);
	const { modal } = App.useApp();
	const [messageApi, contextHolder] = message.useMessage();
	// 顶部操作按钮配置
	const buttonConfigTop = [
		{
			id: 1,
			label: t('service.addComponent'),
			callback: () => {},
			disabled: false
		},
		{
			id: 2,
			label: t('start'),
			callback: () => operateComponent('START', selectComponent),
			disabled: true
		},
		{
			id: 3,
			label: t('stop'),
			callback: () => operateComponent('STOP', selectComponent),
			disabled: true
		},
		{
			id: 4,
			label: t('restart'),
			callback: () => operateComponent('RESTART', selectComponent),
			disabled: true
		},
		{
			id: 5,
			label: t('remove'),
			callback: () => removeComponent(selectComponent),
			disabled: true
		}
	];
	// 单条操作按钮配置
	const buttonConfigItem = record => {
		// const { NodeId, Hostname, SshPort } = record;
		return [
			{
				id: 1,
				label: t('start'),
				callback: () => operateComponent('START', [record]),
				disabled: true
			},
			{
				id: 2,
				label: t('stop'),
				callback: () => operateComponent('STOP', [record])
			},
			{
				id: 3,
				label: t('restart'),
				callback: () => operateComponent('RESTART', [record]),
				disabled: false
			},
			{
				id: 4,
				label: t('remove'),
				callback: () => removeComponent([record]),
				disabled: record.ComponentNodeList[0].SCStateEnum !== 'STOPPED'
			}
		];
	};
	const columns: ColumnsType = [
		{
			title: t('service.componentName'),
			dataIndex: 'ComponentName',
			key: 'ComponentName'
		},
		{
			title: t('service.node'),
			dataIndex: 'ComponentNodeList',
			key: 'ComponentNodeList',
			render: text => {
				return <Text ellipsis={true}>{text.map(item => item.Hostname)}</Text>;
			}
		},
		{
			title: t('service.componentState'),
			dataIndex: 'SCStateEnum',
			key: 'SCStateEnum'
		},
		{
			title: t('operation'),
			key: 'detail',
			dataIndex: 'detail',
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
	const removeComponent = componentList => {
		const idList = componentList.map(component => {
			return {
				ComponentId: component.ComponentId
			};
		});
		modal.confirm({
			title: t('remove'),
			content: t('operationConfirm', { operation: t('remove') }),
			okText: t('confirm'),
			cancelText: t('cancel'),
			onOk: async () => {
				const api = APIConfig.removeComponent;
				const params = {
					ClusterId: id,
					ComponentIdList: idList
				};
				const data = await RequestHttp.post(api, params);
				const { Code } = data;
				if (Code === '00000') {
					messageApi.success(t('messageSuccess'));
					getComponentList();
				}
			}
		});
	};
	const operateComponent = (operation, componentList) => {
		const jobDetailComponentList = componentList.map(component => {
			const jobDetailNodeList = component.ComponentNodeList.map(node => {
				return {
					Hostname: node.Hostname,
					NodeId: node.NodeId,
					NodeIp: node.NodeIp
				};
			});

			return {
				ComponentName: component.ComponentName,
				JobDetailNodeList: jobDetailNodeList
			};
		});
		modal.confirm({
			title: t(operation.toLowerCase()),
			content: t('operationConfirm', { operation: t(operation.toLowerCase()) }),
			okText: t('confirm'),
			cancelText: t('cancel'),
			onOk: async () => {
				const api = APIConfig.operateService;
				const params = {
					ActionTypeEnum: operation,
					ClusterId: id,
					IsOneByOne: false,
					JobDetailServiceList: [
						{
							JobDetailComponentList: jobDetailComponentList,
							ServiceName: serviceName
						}
					]
				};
				const data = await RequestHttp.post(api, params);
				const { Code } = data;
				if (Code === '00000') {
					messageApi.success(t('messageSuccess'));
					getComponentList();
				}
			}
		});
	};
	const getComponentList = async () => {
		setLoading(true);
		const api = APIConfig.componentListByServiceName;
		const params = { ClusterId: id, ServiceName: serviceName };
		const data = await RequestHttp.get(api, { params });
		const {
			Data: { ServiceComponentSummaryList }
		} = data;
		setLoading(false);
		setTableData(ServiceComponentSummaryList[0].ComponentSummaryList);
	};
	const rowSelection = {
		onChange: (_selectedRowKeys: React.Key[], selectedRows: []) => {
			setSelectComponent(selectedRows);
		}
	};

	useEffect(() => {
		getComponentList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<Card className="min-h-[calc(100%-100px)] m-[20px]">
			{contextHolder}
			<Space>
				{buttonConfigTop.map(button => (
					<Button key={button.id} type="primary" disabled={button.disabled} onClick={button.callback}>
						{button.label}
					</Button>
				))}
			</Space>
			<Table
				rowSelection={{
					...rowSelection
				}}
				className="mt-[20px]"
				rowKey="ComponentName"
				columns={columns}
				dataSource={tableData}
				loading={loading}
			/>
		</Card>
	);
};

export default ComponentManage;
