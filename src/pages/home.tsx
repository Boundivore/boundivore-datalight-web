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
 * 集群列表
 * @author Tracy.Guo
 */
import { Table, Button, Card, App, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStore from '@/store/store';

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

const Home: React.FC = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { isNeedChangePassword, setIsNeedChangePassword } = useStore();
	const [loading, setLoading] = useState(false);
	const [tableData, setTableData] = useState([]);
	const { modal } = App.useApp();
	const columns: ColumnsType<DataType> = [
		{
			title: t('cluster.name'),
			dataIndex: 'ClusterName',
			key: 'ClusterName',
			width: '20%'
		},
		{
			title: t('cluster.description'),
			dataIndex: 'ClusterDesc',
			key: 'ClusterDesc',
			width: '20%'
		},
		{
			title: t('cluster.type'),
			dataIndex: 'ClusterType',
			key: 'ClusterType',
			width: '10%'
		},
		{
			title: t('cluster.state'),
			dataIndex: 'ClusterState',
			key: 'ClusterState',
			width: '10%'
		},
		{
			title: t('operation'),
			key: 'IsExistInitProcedure',
			dataIndex: 'IsExistInitProcedure',
			render: (text, record) => {
				const hasAlreadyNode = record.HasAlreadyNode;
				if (hasAlreadyNode && !text) {
					return null;
				} else {
					return (
						<Space>
							<Button
								type="primary"
								size="small"
								ghost
								onClick={() => {
									navigate(`/node/init?id=${record.ClusterId}`);
								}}
							>
								{t('cluster.specifyNode')}
							</Button>
							<Button
								type="primary"
								size="small"
								ghost
								onClick={() => {
									// navigate('/cluster/create');
								}}
							>
								{t('cluster.restart')}
							</Button>
							<Button
								type="primary"
								size="small"
								ghost
								onClick={() => {
									// navigate('/cluster/create');
								}}
							>
								{t('cluster.remove')}
							</Button>
						</Space>
					);
				}
			}
		}
	];
	const getData = async () => {
		setLoading(true);
		const api = APIConfig.getClusterList;
		const data = await RequestHttp.get(api);
		const {
			Data: { ClusterList }
		} = data;
		setTableData(ClusterList);
		setLoading(false);
	};
	useEffect(() => {
		getData();
		// 登录时判断是否需要修改密码
		isNeedChangePassword &&
			modal.confirm({
				title: t('login.changePassword'),
				content: t('login.changePasswordText'),
				okText: t('confirm'),
				cancelText: t('cancel'),
				onOk: () => {
					navigate('/auth/changePassword');
				}
			});
		setIsNeedChangePassword(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<Card className="min-h-[calc(100%-100px)] m-[20px]">
			<Button
				type="primary"
				onClick={() => {
					navigate('/cluster/create');
				}}
			>
				{t('cluster.create')}
			</Button>
			<Table className="mt-[20px]" rowKey="ClusterId" columns={columns} dataSource={tableData} loading={loading} />
		</Card>
	);
};

export default Home;
