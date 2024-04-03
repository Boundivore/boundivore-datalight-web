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
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Button, Card, App, Space, message, Badge } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import useStore from '@/store/store';
import useNavigater from '@/hooks/useNavigater';
import { ClusterType, BadgeStatus } from '@/api/interface';

const Home: React.FC = () => {
	const { t } = useTranslation();
	const [messageApi, contextHolder] = message.useMessage();
	const { stateText, isNeedChangePassword, setIsNeedChangePassword } = useStore();
	const [loading, setLoading] = useState(false);
	const [tableData, setTableData] = useState([]);
	const { navigateToChangePassword, navigateToNodeInit, navigateToCreateCluster } = useNavigater();
	const { modal } = App.useApp();
	// 顶部操作按钮配置
	const buttonConfigTop = [
		{
			id: 1,
			label: t('cluster.create'),
			callback: navigateToCreateCluster
		}
	];
	// 单条操作按钮配置
	const buttonConfigItem = (text: string, record: ClusterType) => {
		const { HasAlreadyNode, ClusterName, ClusterId } = record;
		return [
			{
				id: 1,
				label: t('cluster.restart'),
				callback: () => {},
				disabled: HasAlreadyNode && !text
			},
			{
				id: 2,
				label: t('cluster.remove'),
				callback: () => removeCluster(ClusterName, ClusterId),
				disabled: HasAlreadyNode
			},
			{
				id: 3,
				label: t('cluster.specifyNode'),
				callback: () => navigateToNodeInit(ClusterId),
				disabled: HasAlreadyNode && !text,
				hide: HasAlreadyNode && !text
			}
		];
	};
	const columns: ColumnsType<ClusterType> = [
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
			width: '10%',
			render: text => t(text.toLowerCase())
		},
		{
			title: t('cluster.state'),
			dataIndex: 'ClusterState',
			key: 'ClusterState',
			width: '10%',
			// render: (text: string) => t(text.toLowerCase())
			render: (text: string) => <Badge status={stateText[text].status as BadgeStatus} text={t(stateText[text].label)} />
		},
		{
			title: t('operation'),
			key: 'IsExistInitProcedure',
			dataIndex: 'IsExistInitProcedure',
			render: (text, record) => (
				<Space>
					{buttonConfigItem(text, record)
						.filter(item => !item.hide)
						.map(button => (
							<Button key={button.id} type="primary" size="small" ghost disabled={button.disabled} onClick={button.callback}>
								{button.label}
							</Button>
						))}
				</Space>
			)
		}
	];
	const removeCluster = (clusterName: string, clusterId: string | number) => {
		modal.confirm({
			title: t('cluster.remove'),
			content: t('cluster.removeConfirm', { clusterName }),
			okText: t('confirm'),
			cancelText: t('cancel'),
			onOk: async () => {
				const api = APIConfig.removeCluster;
				const data = await RequestHttp.post(api, { ClusterId: clusterId });
				const { Code } = data;
				if (Code === '00000') {
					messageApi.success(t('messageSuccess'));
					getData();
				}
			}
		});
	};
	const getData = async () => {
		setLoading(false);
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
				onOk: navigateToChangePassword
			});
		setIsNeedChangePassword(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<Card className="min-h-[calc(100%-100px)] m-[20px]">
			{contextHolder}
			<Space>
				{buttonConfigTop.map(button => (
					<Button key={button.id} type="primary" onClick={button.callback}>
						{button.label}
					</Button>
				))}
			</Space>
			<Table className="mt-[20px]" rowKey="ClusterId" columns={columns} dataSource={tableData} loading={loading} />
		</Card>
	);
};

export default Home;
