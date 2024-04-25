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
 * @author Tracy
 */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, App, Col, Row, Table, Badge, Empty, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import useStore from '@/store/store';
import useNavigater from '@/hooks/useNavigater';
import { ClusterType, BadgeStatus } from '@/api/interface';
import { config } from '@/components/charts/config';
import ContainerCard from '@/components/containerCard';
import usePrometheusStatus from '@/hooks/usePrometheusStatus';
import { RenderConfig } from '@/components/charts/renderConfig';

const homeJobName = 'MONITOR-NodeExporter';
const Home: React.FC = () => {
	const { t } = useTranslation();
	const [tableData, setTableData] = useState<ClusterType[]>([]);
	const [activeCluster, setActiveCluster] = useState('');
	const [activeClusterId, setActiveClusterId] = useState('');
	const { stateText, isNeedChangePassword, setIsNeedChangePassword, setJobName } = useStore();
	const { navigateToChangePassword, navigateToCreateCluster } = useNavigater();
	const { hasPrometheus } = usePrometheusStatus();
	const { modal } = App.useApp();
	const columns: ColumnsType<ClusterType> = [
		{
			title: t('cluster.name'),
			dataIndex: 'ClusterName',
			key: 'ClusterName',
			width: '20%'
		},
		{
			title: t('cluster.state'),
			dataIndex: 'ClusterState',
			key: 'ClusterState',
			width: '10%',
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

	useEffect(() => {
		activeClusterId && setJobName(homeJobName);
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
	const rowClassName = (record: ClusterType) => {
		return activeCluster === record.ClusterName ? 'bg-[#f0fcff]' : '';
	};
	return (
		<ContainerCard>
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
							{hasPrometheus ? (
								activeClusterId && <RenderConfig config={config.HOME} selectCluster={activeClusterId} />
							) : (
								<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span>尚未部署Prometheus</span>}></Empty>
							)}
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
		</ContainerCard>
	);
};

export default Home;
