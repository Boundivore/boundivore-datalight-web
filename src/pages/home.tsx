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
 * home 仪表板
 * @author Tracy.Guo
 */
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, App, Tabs, Flex } from 'antd';
import type { TabsProps } from 'antd';

import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import useStore from '@/store/store';
import useNavigater from '@/hooks/useNavigater';
import useCurrentCluster from '@/hooks/useCurrentCluster';

const Home: React.FC = () => {
	const { t } = useTranslation();
	const { isNeedChangePassword, setIsNeedChangePassword } = useStore();
	const { navigateToChangePassword } = useNavigater();
	const { clusterComponent } = useCurrentCluster();
	const { modal } = App.useApp();

	const items: TabsProps['items'] = [
		{
			key: '1',
			label: '概览',
			children: 'Content of Tab Pane 1'
		},
		{
			key: '2',
			label: '监控',
			children: 'Content of Tab Pane 2'
		}
	];

	const getData = async () => {
		// setLoading(false);
		const api = APIConfig.getClusterList;
		await RequestHttp.get(api);
		// setTableData(ClusterList);
		// setLoading(false);
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
				onOk: navigateToChangePassword
			});
		setIsNeedChangePassword(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<Card className="min-h-[calc(100%-100px)] m-[20px]">
			{/* {contextHolder} */}
			<Flex justify="flex-end">{clusterComponent}</Flex>
			<Tabs defaultActiveKey="1" items={items} />
			{/* <Table className="mt-[20px]" rowKey="ClusterId" columns={columns} dataSource={tableData} loading={loading} /> */}
		</Card>
	);
};

export default Home;
