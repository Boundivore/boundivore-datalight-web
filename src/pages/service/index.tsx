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
 * 服务管理列表页
 * @author Tracy.Guo
 */
import { FC, Key, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Button, Card, Select, Flex, Space, App, Badge, message } from 'antd';
import type { TableColumnsType, SelectProps } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import usePolling from '@/hooks/usePolling';
import useNavigater from '@/hooks/useNavigater';
import { updateCurrentView } from '@/utils/helper';
import { ClusterType, ServiceItemType, BadgeStatus } from '@/api/interface';
import useStore from '@/store/store';

const stateArray = ['SELECTED', 'SELECTED_ADDITION', 'UNSELECTED', 'REMOVED'];
const ServiceManage: FC = () => {
	const { t } = useTranslation();
	const { stateText } = useStore();
	const [loading, setLoading] = useState(false);
	const [selectData, setSelectData] = useState<SelectProps['options']>([]);
	const [selectService, setSelectService] = useState<ServiceItemType[]>([]);
	const [defaultSelectValue, setDefaultSelectValue] = useState('');
	const [allowAdd, setAllowAdd] = useState(false); // 是否允许新增服务操作,默认不允许
	const [startDisabled, setStartDisabled] = useState(false); // 是否禁用批量启动
	const [stopDisabled, setStopDisabled] = useState(false); // 是否禁用批量停止
	const { navigateToComManage, navigateToConfig, navigateToAddComponent } = useNavigater();
	const { modal } = App.useApp();
	const [messageApi, contextHolder] = message.useMessage();
	console.log(startDisabled, stopDisabled);
	// 顶部操作按钮配置
	const buttonConfigTop = [
		{
			id: 1,
			label: t('service.addService'),
			callback: () => addService(),
			disabled: false
		},
		{
			id: 2,
			label: t('service.startService'),
			callback: () => operateComponent('START'),
			disabled: selectService.length === 0
		},
		{
			id: 3,
			label: t('service.stopService'),
			callback: () => operateComponent('STOP'),
			disabled: selectService.length === 0
		},
		{
			id: 4,
			label: t('service.restartService'),
			callback: () => operateComponent('RESTART'),
			disabled: selectService.length === 0
		}
	];
	// 单条操作按钮配置
	const buttonConfigItem = (record: ServiceItemType) => {
		const { ServiceName } = record;
		return [
			{
				id: 1,
				label: t('modifyConfig'),
				callback: () => navigateToConfig(defaultSelectValue, ServiceName),
				disabled: record?.SCStateEnum !== 'DEPLOYED'
			},
			{
				id: 2,
				label: t('service.componentManage'),
				callback: () => navigateToComManage(defaultSelectValue, ServiceName),
				// disabled: !record.ComponentNodeList || record.ComponentNodeList.length === 0
				disabled: record?.SCStateEnum !== 'DEPLOYED'
			}
		];
	};
	const columns: TableColumnsType<ServiceItemType> = [
		{
			title: t('service.serviceName'),
			dataIndex: 'ServiceName',
			key: 'ServiceName'
		},
		{
			title: t('service.serviceType'),
			dataIndex: 'ServiceType',
			key: 'ServiceType',
			render: text => t(text.toLowerCase()),
			filters: [
				{
					text: t('base'),
					value: 'BASE'
				},
				{
					text: t('storage'),
					value: 'STORAGE'
				},
				{
					text: t('compute'),
					value: 'COMPUTE'
				}
			],
			onFilter: (value: any, record) => record.ServiceType.indexOf(value) === 0
		},
		{
			title: t('description'),
			dataIndex: 'Desc',
			key: 'Desc'
		},
		{
			title: t('state'),
			dataIndex: 'SCStateEnum',
			key: 'SCStateEnum',
			render: (text: string) => {
				const stateMachine = (currentState: string) => {
					// 在这里，我们可以添加更复杂的逻辑来处理状态转换
					// 但由于题目要求不论输入什么状态都返回'undeployed'，所以直接返回即可
					if (stateArray.includes(currentState)) {
						return 'UNDEPLOYED';
					} else {
						return currentState;
					}
				};

				const outputState = stateMachine(text);
				return <Badge status={stateText[outputState].status as BadgeStatus} text={t(stateText[outputState].label)} />;
			},
			filters: [
				{
					text: t('service.undeployed'),
					// 这里与antd中ColumnFilterItem无法保持一致，用any兼容
					value: stateArray as any
				},
				{
					text: t('service.changing'),
					value: 'CHANGING'
				},
				{
					text: t('service.deployed'),
					value: 'DEPLOYED'
				}
			],
			onFilter: (value, record) => {
				if (Array.isArray(value)) {
					// 如果value是数组，检查record中的值是否存在于数组中
					return value.includes(record.SCStateEnum);
				} else {
					// 如果value不是数组，进行常规比较
					return record.SCStateEnum === value;
				}
			}
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
	const addService = () => {
		if (allowAdd) {
			navigateToAddComponent(defaultSelectValue);
		} else {
			modal.info({
				title: '当前不支持新增服务操作，请优先服役节点到指定集群'
			});
		}
	};
	const operateComponent = (operation: string) => {
		modal.confirm({
			title: t(operation.toLowerCase()),
			content: t('operationConfirm', { operation: t(operation.toLowerCase()) }),
			okText: t('confirm'),
			cancelText: t('cancel'),
			onOk: async () => {
				const api = APIConfig.operateJob;
				const params = {
					ActionTypeEnum: operation,
					ClusterId: defaultSelectValue,
					IsOneByOne: false,
					ServiceNameList: selectService.map(service => service.ServiceName)
				};
				const data = await RequestHttp.post(api, params);
				const { Code } = data;
				if (Code === '00000') {
					messageApi.success(t('messageSuccess'));
					// getComponentList();
				}
			}
		});
	};
	const getClusterList = async () => {
		setLoading(true);
		const api = APIConfig.getClusterList;
		const { Data } = await RequestHttp.get(api);
		const clusterList: ClusterType[] = Data.ClusterList;
		const listData = clusterList.map(item => {
			return {
				value: item.ClusterId,
				label: item.ClusterName,
				hasAlreadyNode: item.HasAlreadyNode
			};
		});
		setLoading(false);
		setSelectData(listData);
		const currentViewCluster = clusterList.find(cluster => cluster.IsCurrentView === true);
		if (currentViewCluster) {
			// 如果找到了，设置setSelectCluster为该项的ClusterId
			setDefaultSelectValue(currentViewCluster.ClusterId);
			setAllowAdd(currentViewCluster.HasAlreadyNode);
		} else {
			// 如果没有找到，则使用第一项的ClusterId
			clusterList.length > 0 ? setDefaultSelectValue(clusterList[0].ClusterId) : setDefaultSelectValue(''); // 确保数组不为空
			clusterList.length > 0 ? setAllowAdd(clusterList[0].HasAlreadyNode) : setAllowAdd(false); // 确保数组不为空
		}
	};
	const getServiceList = async () => {
		const api = APIConfig.serviceList;
		const data = await RequestHttp.get(api, { params: { ClusterId: defaultSelectValue } });
		const {
			Data: { ServiceSummaryList }
		} = data;
		return ServiceSummaryList;
		// setTableData(ServiceSummaryList);
	};
	const handleChange = async (value: string, option: DefaultOptionType | DefaultOptionType[]) => {
		await updateCurrentView(value);
		setDefaultSelectValue(value);
		if (Array.isArray(option)) {
			// 如果 option 是数组，则处理数组中的第一个元素
			setAllowAdd(option[0].hasAlreadyNode);
		} else {
			// 如果 option 不是数组，则直接处理
			setAllowAdd(option.hasAlreadyNode);
		}
	};
	const tableData: ServiceItemType[] = usePolling(getServiceList, [], 1000, [defaultSelectValue]);

	useEffect(() => {
		getClusterList();
	}, []);
	useEffect(() => {
		// 检查所有组件是否都处于'STOPPED'状态
		// const allStopped = selectService.length > 0 && selectService.every(item => item.SCStateEnum === 'STOPPED');

		// 更新按钮的禁用状态
		setStartDisabled(false); // 如果不全是'STOPPED'，则开始按钮禁用
		setStopDisabled(false); // 如果全是'STOPPED'，则停止按钮禁用
	}, [selectService]); // 在 selectComponent 变化时触发
	const rowSelection = {
		onChange: (_selectedRowKeys: Key[], selectedRows: ServiceItemType[]) => {
			console.log(selectedRows);
			// const filteredselectedRows = selectedRows.filter(item => item.ComponentId);
			setSelectService(selectedRows);
		}
	};
	return (
		<Card className="min-h-[calc(100%-50px)] m-[20px]">
			{contextHolder}
			<Flex justify="space-between">
				<Space>
					{buttonConfigTop.map(button => (
						<Button key={button.id} type="primary" disabled={button.disabled} onClick={button.callback}>
							{button.label}
						</Button>
					))}
				</Space>
				<div>
					{t('node.currentCluster')}
					<Select className="w-[200px]" options={selectData} value={defaultSelectValue} onChange={handleChange} />
				</div>
			</Flex>
			<Table
				rowSelection={{
					...rowSelection
				}}
				className="mt-[20px]"
				rowKey="ServiceName"
				columns={columns}
				dataSource={tableData}
				loading={loading}
			/>
		</Card>
	);
};

export default ServiceManage;
