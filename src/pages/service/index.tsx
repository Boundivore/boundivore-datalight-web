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
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Button, Card, Select, Flex, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import useNavigater from '@/hooks/useNavigater';
import { ClusterType, ServiceItemType } from '@/api/interface';

const ServiceManage: React.FC = () => {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(false);
	const [tableData, setTableData] = useState([]);
	const [selectData, setSelectData] = useState([]);
	const [defaultSelectValue, setDefaultSelectValue] = useState('');
	const { navigateToComManage, navigateToConfig } = useNavigater();

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
	const columns: ColumnsType<ServiceItemType> = [
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
	const getClusterList = async () => {
		setLoading(true);
		const api = APIConfig.getClusterList;
		const data = await RequestHttp.get(api);
		const {
			Data: { ClusterList }
		} = data;
		const listData = ClusterList.map((item: { ClusterId: string; ClusterName: string }) => {
			return {
				value: item.ClusterId,
				label: item.ClusterName
			};
		});
		setLoading(false);
		setSelectData(listData);
		const currentViewCluster = ClusterList.find((cluster: ClusterType) => cluster.IsCurrentView === true);
		if (currentViewCluster) {
			// 如果找到了，设置setSelectCluster为该项的ClusterId
			setDefaultSelectValue(currentViewCluster.ClusterId);
		} else {
			// 如果没有找到，则使用第一项的ClusterId
			ClusterList.length > 0 ? setDefaultSelectValue(ClusterList[0].ClusterId) : setDefaultSelectValue(''); // 确保数组不为空
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
	const handleChange = (value: string) => {
		setDefaultSelectValue(value);
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
