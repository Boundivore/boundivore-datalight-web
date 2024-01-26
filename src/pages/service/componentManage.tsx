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
import { Table, Button, Card, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
// import useNavigater from '@/hooks/useNavigater';

interface DataType {
	HasAlreadyNode: boolean;
	ClusterId: number;
	ClusterDesc: string;
	ClusterName: string;
	ClusterType: string;
	ClusterState: string;
	DlcVersion: string;
	RelativeClusterId: number;
}

const ComponentManage: React.FC = () => {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	// const serviceName = searchParams.get('name');
	const [loading, setLoading] = useState(false);
	const [tableData, setTableData] = useState([]);
	// const { navigateToComManage } = useNavigater();
	// const { modal } = App.useApp();
	// 顶部操作按钮配置
	// const buttonConfig = [
	// 	{
	// 		id: 1,
	// 		label: 'Button 1',
	// 		callback: () => handleButtonClick(1),
	// 		disabled: false
	// 	},
	// 	{
	// 		id: 2,
	// 		label: 'Button 2',
	// 		callback: () => handleButtonClick(2),
	// 		disabled: true
	// 	}
	// ];

	const columns: ColumnsType<DataType> = [
		{
			title: t('service.serviceName'),
			dataIndex: 'ServiceName',
			key: 'ServiceName'
		},
		{
			title: t('service.serviceType'),
			dataIndex: 'ServiceType',
			key: 'ServiceType'
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
			render: () => {
				return (
					<Space>
						<Button
							type="primary"
							size="small"
							ghost
							onClick={() => {
								// navigate('/cluster/create');
							}}
						>
							{t('detail')}
						</Button>
					</Space>
				);
				// }
			}
		}
	];
	const getComponentList = async () => {
		setLoading(true);
		const api = APIConfig.componentList;
		const data = await RequestHttp.get(api, { params: { ClusterId: id } });
		const {
			Data: { ServiceComponentSummaryList }
		} = data;
		setLoading(false);
		setTableData(ServiceComponentSummaryList);
	};

	useEffect(() => {
		getComponentList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<Card className="min-h-[calc(100%-100px)] m-[20px]">
			<Table className="mt-[20px]" rowKey="NodeId" columns={columns} dataSource={tableData} loading={loading} />
		</Card>
	);
};

export default ComponentManage;
