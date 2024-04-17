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
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, App, Col, Row, Table, Badge, Space, Empty, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import useStore from '@/store/store';
import useNavigater from '@/hooks/useNavigater';
import { ClusterType, BadgeStatus } from '@/api/interface';
import GaugeComponent from '@/components/charts/gauge';
import LineComponent from '@/components/charts/line';
import TextComponent from '@/components/charts/text';
import { config } from '@/components/charts/config';
// import { TimerComponent } from '@/components/charts/params';

const componentMap = {
	gauge: GaugeComponent,
	text: TextComponent,
	time: TextComponent,
	number: TextComponent,
	byte: TextComponent,
	self: TextComponent,
	line: LineComponent
	// 其他类型组件...
};

const renderComponent = (type, clusterId, query, unit) => {
	const ComponentToRender = componentMap[type] || null; // 获取对应的组件类型，如果找不到则返回null
	return ComponentToRender && <ComponentToRender clusterId={clusterId} query={query} unit={unit} type={type} height={250} />;
};

const renderConfig = (config, selectCluster) => {
	return (
		<Space direction="vertical" className="flex">
			{config.map(item => (
				<Row style={{ height: `${item.height}` }} key={item.key} gutter={8} wrap={false}>
					{item.cols.map(col => (
						<Col key={col.title} span={col.span}>
							{col.rows ? (
								<Space direction="vertical" className="flex">
									{col.rows.map(row => {
										return (
											// <Row>
											<Card style={{ height: '170px' }}>
												<span>{row.title}</span>
												{renderComponent(row.type, selectCluster, row.query, row.unit)}
											</Card>
											// </Row>
										);
									})}
								</Space>
							) : (
								<Card style={{ height: `${item.height}` }}>
									<span>{col.title}</span>
									{renderComponent(col.type, selectCluster, col.query, col.unit)}
								</Card>
							)}
						</Col>
					))}
				</Row>
			))}
		</Space>
	);
};
// const jobName = 'DATALIGHT-Master';
const jobName = 'MONITOR-NodeExporter';
const Home: React.FC = () => {
	const { t } = useTranslation();
	const [tableData, setTableData] = useState([]);
	const [activeCluster, setActiveCluster] = useState('');
	const [activeClusterId, setActiveClusterId] = useState('');
	const [instance, setInstance] = useState('');
	const { stateText, isNeedChangePassword, setIsNeedChangePassword } = useStore();
	const { navigateToChangePassword, navigateToCreateCluster } = useNavigater();
	const { modal } = App.useApp();
	const columns: ColumnsType<ClusterType> = [
		{
			title: t('cluster.name'),
			dataIndex: 'ClusterName',
			key: 'ClusterName',
			width: '20%'
		},
		// {
		// 	title: t('cluster.type'),
		// 	dataIndex: 'ClusterType',
		// 	key: 'ClusterType',
		// 	width: '10%',
		// 	render: text => t(text.toLowerCase())
		// },
		{
			title: t('cluster.state'),
			dataIndex: 'ClusterState',
			key: 'ClusterState',
			width: '10%',
			// render: (text: string) => t(text.toLowerCase())
			render: (text: string) => <Badge status={stateText[text].status as BadgeStatus} text={t(stateText[text].label)} />
		}
	];
	const getData = async () => {
		// setLoading(false);
		const api = APIConfig.getClusterList;
		const data = await RequestHttp.get(api);
		const {
			Data: { ClusterList }
		} = data;
		setTableData(ClusterList);
		ClusterList.length && setActiveCluster(ClusterList[0].ClusterName);
		ClusterList.length && setActiveClusterId(ClusterList[0].ClusterId);
		// setLoading(false);
	};
	const getInstanceData = async () => {
		const api = APIConfig.prometheus;
		const params = {
			Body: '',
			ClusterId: activeClusterId,
			Path: '/api/v1/query',
			QueryParamsMap: {
				query: `node_uname_info{job="${jobName}"}`
			},
			RequestMethod: 'GET'
		};
		const { Data } = await RequestHttp.post(api, params);
		const {
			data: { result }
		} = JSON.parse(Data);
		// 提取所有job，并使用Set去重
		const uniqueSet = new Set(result.map(item => item.metric.instance));

		setInstance([...uniqueSet][0]);
	};
	useEffect(() => {
		activeClusterId && getInstanceData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [activeClusterId]);
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
	const rowClassName = record => {
		return activeCluster === record.ClusterName ? 'bg-[#f0fcff]' : '';
	};
	return (
		<Card className="min-h-[calc(100%-100px)] m-[20px]">
			{tableData.length ? (
				<Row gutter={24} className="mt-[20px]">
					<Col span={6}>
						<Card className="data-light-card">
							<Table
								className="mt-[20px] cursor-pointer"
								rowKey="ClusterId"
								columns={columns}
								dataSource={tableData}
								onRow={record => {
									return {
										onClick: () => {
											setActiveCluster(record.ClusterName);
											setActiveClusterId(record.ClusterId);
										}
									};
								}}
								pagination={false}
								rowClassName={rowClassName}
							/>
						</Card>
					</Col>
					<Col span={18}>
						<Card className="data-light-card" title={activeCluster}>
							{activeClusterId && instance && renderConfig(config(jobName, instance).HOME, activeClusterId)}
						</Card>
					</Col>
				</Row>
			) : (
				<Empty image={Empty.PRESENTED_IMAGE_SIMPLE}>
					<Button type="primary" onClick={navigateToCreateCluster}>
						{t('cluster.create')}
					</Button>
				</Empty>
			)}
		</Card>
	);
};

export default Home;
