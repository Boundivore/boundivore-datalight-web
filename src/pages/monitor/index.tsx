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
// import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Table, Card, Row, Col, Flex, Space, Empty } from 'antd';
import useStore from '@/store/store';
import GaugeComponent from '@/components/charts/gauge';
import LineComponent from '@/components/charts/line';
import TextComponent from '@/components/charts/text';
import { config, monitorItems } from '@/components/charts/config';
import { JobNameComponent, TimerComponent } from '@/components/charts/params';
import useCurrentCluster from '@/hooks/useCurrentCluster';
import usePrometheusStatus from '@/hooks/usePrometheusStatus';

const componentMap = {
	gauge: GaugeComponent,
	text: TextComponent,
	time: TextComponent,
	line: LineComponent
	// 其他类型组件...
};

const renderComponent = (type, clusterId, query, unit) => {
	const ComponentToRender = componentMap[type] || null; // 获取对应的组件类型，如果找不到则返回null
	return ComponentToRender && <ComponentToRender clusterId={clusterId} query={query} unit={unit} type={type} />;
};

const renderConfig = (config, selectCluster) => {
	return (
		<Space direction="vertical" className="flex">
			{config.map(item => (
				<Row style={{ height: `${item.height}` }} key={item.key} gutter={8} wrap={false}>
					{item.cols.map(col => (
						<Col key={col.key} span={col.span}>
							{col.rows ? (
								<Space direction="vertical" className="flex" key={`${col.key}-space`}>
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
		<Card className="min-h-[calc(100%-100px)] m-[20px]">
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
										renderConfig(config[activeComponent], selectCluster)
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
		</Card>
	);
};
export default Monitor;
