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
 * @author Tracy
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Card, Row, Col, Flex, Space, Empty } from 'antd';
import useStore from '@/store/store';
import { config, monitorItems } from '@/components/charts/config';
import { JobNameComponent, TimerComponent } from '@/components/charts/params';
import useCurrentCluster from '@/hooks/useCurrentCluster';
import usePrometheusStatus from '@/hooks/usePrometheusStatus';
import ContainerCard from '@/components/containerCard';
import { RenderConfig } from '@/components/charts/renderConfig';

const Monitor = () => {
	const { t } = useTranslation();
	const { jobName, instance } = useStore();
	const [activeComponent, setActiveComponent] = useState(monitorItems[0].uid);
	const { hasPrometheus } = usePrometheusStatus();
	const { clusterComponent, selectCluster } = useCurrentCluster();

	const columns = [
		{
			title: t('service.componentName'),
			dataIndex: 'uid',
			key: 'uid',
			render: text => <span>{text}</span>
		}
	];

	const rowClassName = record => {
		return activeComponent === record.uid ? 'bg-[#f0fcff]' : '';
	};

	return (
		<ContainerCard>
			{selectCluster ? (
				<>
					<Flex justify="space-between">
						{clusterComponent}
						<Space size="large">
							{selectCluster && activeComponent && (
								<JobNameComponent clusterId={selectCluster} activeComponent={activeComponent} />
							)}
							<TimerComponent />
						</Space>
					</Flex>
					<Row gutter={24} className="mt-[20px]">
						<Col span={6}>
							<Card className="data-light-card">
								<Table
									className="mt-[20px] cursor-pointer"
									rowKey="uid"
									columns={columns}
									dataSource={monitorItems}
									onRow={record => {
										return {
											onClick: () => {
												setActiveComponent(record.uid);
											}
										};
									}}
									pagination={false}
									rowClassName={rowClassName}
								/>
							</Card>
						</Col>
						<Col span={18}>
							<Card className="data-light-card" title={activeComponent}>
								{hasPrometheus ? (
									selectCluster && jobName && instance && config[activeComponent] ? (
										<RenderConfig config={config[activeComponent]} selectCluster={selectCluster} />
									) : (
										<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
									)
								) : (
									<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span>尚未部署Prometheus</span>}></Empty>
								)}
							</Card>
						</Col>
					</Row>
				</>
			) : (
				<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
			)}
		</ContainerCard>
	);
};
export default Monitor;
