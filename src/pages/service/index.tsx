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
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Button, Card, Select, Flex, Space, App } from 'antd';
import type { TableColumnsType, SelectProps } from 'antd';
import { DefaultOptionType } from 'antd/es/select';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import useNavigater from '@/hooks/useNavigater';
import { updateCurrentView } from '@/utils/helper';
import { ClusterType, ServiceItemType } from '@/api/interface';

const ServiceManage: FC = () => {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const [tableData, setTableData] = useState<ServiceItemType[]>([]);
	const [selectData, setSelectData] = useState<SelectProps['options']>([]);
	const [defaultSelectValue, setDefaultSelectValue] = useState('');
	const [allowAdd, setAllowAdd] = useState(false); // 是否允许新增服务操作,默认不允许
	const { navigateToComManage, navigateToConfig, navigateToAddComponent } = useNavigater();
	const { modal } = App.useApp();
	// 顶部操作按钮配置
	const buttonConfigTop = [
		{
			id: 1,
			label: t('service.addService'),
			callback: () => addService(),
			disabled: false
		}
		// {
		// 	id: 2,
		// 	label: t('service.startService'),
		// 	callback: () => operateComponent('START', selectComponent),
		// 	disabled: startDisabled
		// },
		// {
		// 	id: 3,
		// 	label: t('service.stopService'),
		// 	callback: () => operateComponent('STOP', selectComponent),
		// 	disabled: stopDisabled
		// },
		// {
		// 	id: 4,
		// 	label: t('service.restartService'),
		// 	callback: () => operateComponent('RESTART', selectComponent),
		// 	disabled: selectComponent.length === 0
		// }
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
	const getServiceList = async (id: string | number) => {
		const api = APIConfig.serviceList;
		const data = await RequestHttp.get(api, { params: { ClusterId: id } });
		const {
			Data: { ServiceSummaryList }
		} = data;
		setTableData(ServiceSummaryList);
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
	useEffect(() => {
		defaultSelectValue && getServiceList(defaultSelectValue);
	}, [defaultSelectValue]);
	useEffect(() => {
		getClusterList();
	}, []);
	return (
		<Card className="min-h-[calc(100%-50px)] m-[20px]">
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
			<Table className="mt-[20px]" rowKey="ServiceName" columns={columns} dataSource={tableData} loading={loading} />
		</Card>
	);
};

export default ServiceManage;
