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
import Layouts from '@/layouts';
import { Table, Button, Card, App } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useStore from '@/store/store';

interface DataType {
	ClusterId: number;
	ClusterDesc: string;
	ClusterName: string;
	ClusterType: string;
	ClusterState: string;
	DlcVersion: string;
	RelativeClusterId: number;
}

const columns: ColumnsType<DataType> = [
	{
		title: 'Name',
		dataIndex: 'ClusterName',
		key: 'ClusterName',
		render: (text, record) => <a href={`/node/init?id=${record.ClusterId}`}>{text}</a>
	},
	{
		title: 'Age',
		dataIndex: 'ClusterDesc',
		key: 'ClusterDesc'
	},
	{
		title: 'Address',
		dataIndex: 'ClusterType',
		key: 'ClusterType'
	},
	{
		title: 'Tags',
		key: 'ClusterState',
		dataIndex: 'ClusterState'
	}
];

const Home: React.FC = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const { isNeedChangePassword } = useStore();
	const [tableData, setTableData] = useState([]);
	const { modal } = App.useApp();
	const api = APIConfig.getClusterList;
	const getData = async () => {
		const data = await RequestHttp.get(api);
		const {
			Data: { ClusterList }
		} = data;
		setTableData(ClusterList);
	};
	useEffect(() => {
		getData();
		isNeedChangePassword &&
			modal.confirm({
				title: t('login.changePassword'),
				content: t('login.changePasswordText')
			});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<Layouts>
			<Card className="h-[calc(100%-100px)] min-h-[600px] m-[20px]">
				<Button
					type="primary"
					onClick={() => {
						navigate('/cluster/create');
					}}
				>
					{t('cluster.create')}
				</Button>
				<Table rowKey="ClusterId" columns={columns} dataSource={tableData} />
			</Card>
		</Layouts>
	);
};

export default Home;
