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
// import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import { Table, Card, Row, Col, Flex, Select, Space } from 'antd';
// import RequestHttp from '@/api';
// import APIConfig from '@/api/config';
import useStore from '@/store/store';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
// import { Gauge } from '@ant-design/charts';
import { Gauge, Line } from '@ant-design/plots';
import { transformData } from '@/utils/helper';
import useCurrentCluster from '@/hooks/useCurrentCluster';

// import { Gauge } from '@antv/g2plot';

const Monitor = () => {
	const { t } = useTranslation();
	const { monitorItems } = useStore();
	const [activeComponent, setActiveComponent] = useState(monitorItems[0].uid);
	const [gaugeData, setGaugeData] = useState(0);
	const [lineData, setLineData] = useState([]);
	const { clusterComponent } = useCurrentCluster();

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
	const getGaugeData = async () => {
		const api = APIConfig.prometheus;
		const params = {
			Body: '',
			ClusterId: '1775417669466292226',
			Path: '/api/v1/query',
			QueryParamsMap: {
				// query: 'Hadoop_DataNode_capacity{name="FsDatasetstate", instance="node01:17005"}',
				// query:
				// 	'sum(jvm_memory_used_bytes{job="DATALIGHT-Master", instance=~"node01:8001", area="heap"})*100/sum(jvm_memory_max_bytes{job="DATALIGHT-Master", instance=~"node01:8001", area="heap"})',
				query: 'druid_initial_size'
				// time: '1712128729.98'
			},
			RequestMethod: 'GET'
		};
		const { Data } = await RequestHttp.post(api, params);
		const {
			data: { result }
		} = JSON.parse(Data);
		console.log('result', result[0].value[1]);
		setGaugeData(parseFloat(result[0].value[1]).toFixed(2));
		console.log(8888, {
			width: 360,
			height: 360,
			autoFit: true,
			legend: false,
			style: {
				textContent: target => `${target}%`
			},
			data: {
				total: 100,
				name: 'score',
				target: result[0].value[1]
			}
		});
		// setGaugeData(prevState => {
		// 	console.log(666, {
		// 		...prevState,
		// 		data: {
		// 			...prevState.data,
		// 			target: 0 //result[0].value[1] // 设置 Gauge 组件的目标值为从 Prometheus 获取的值
		// 		}
		// 	});
		// 	return {
		// 		width: 360,
		// 		height: 360,
		// 		autoFit: true,
		// 		data: {
		// 			target: 12, // 默认值为0
		// 			total: 100,
		// 			name: 'score'
		// 		},
		// 		legend: false,
		// 		style: {
		// 			textContent: target => `${target}%`
		// 		}
		// 	};
		// });
	};
	const getLineData = async () => {
		const api = APIConfig.prometheus;
		const params = {
			Body: '',
			ClusterId: '1775417669466292226',
			Path: '/api/v1/query_range',
			QueryParamsMap: {
				query: 'system_cpu_usage{job="DATALIGHT-Master", instance=~"node01:8001"}',
				start: '1712652335.023',
				end: '1712652635.023',
				step: 14
			},
			RequestMethod: 'GET'
		};
		const { Data } = await RequestHttp.post(api, params);
		console.log(1111111, JSON.parse(Data));
		const formattedData = transformData(JSON.parse(Data).data.result[0].values);
		console.log('formattedData', formattedData);
		setLineData(formattedData);
	};

	useEffect(() => {
		getGaugeData();
		getLineData();
	}, []);
	return (
		<Card className="min-h-[calc(100%-100px)] m-[20px]">
			<Flex justify="flex-end">{clusterComponent}</Flex>
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
					<Card
						className="data-light-card"
						title={activeComponent}
						extra={
							<Space size="large">
								<Space>
									jobName:
									<Select style={{ width: 120 }} options={[{ value: 'sample', label: <span>sample</span> }]} />
								</Space>
								<Space>
									jobName:
									<Select style={{ width: 120 }} options={[{ value: 'sample', label: <span>sample</span> }]} />
								</Space>
							</Space>
						}
					>
						<Row className="h-[150px]">
							<Col span={12}>
								<Card className="h-[150px]">
									<span>持续时间</span>
								</Card>
							</Col>
							<Col span={12}>
								<Card className="h-[150px]">
									<span>开始时间</span>
								</Card>
							</Col>
						</Row>
						<Row>
							<Col span={12}>
								<Card>
									<span>heap</span>
									<Gauge
										width={360}
										height={360}
										autoFit={true}
										data={{
											target: gaugeData,
											total: 100,
											name: 'score'
										}}
										legend={false}
										style={{
											textContent: target => `${target}%`
										}}
									/>
								</Card>
							</Col>
							<Col span={12}>
								<span>non-heap</span>
								<Gauge
									width={360}
									height={360}
									autoFit={true}
									data={{
										target: gaugeData,
										total: 100,
										name: 'score'
									}}
									legend={false}
									style={{
										textContent: target => `${target}%`
									}}
								/>
							</Col>
						</Row>
						<Row>
							<Col span={12}>
								<Line
									data={lineData}
									height={300}
									xField="x"
									yField="y"
									point={{
										shapeField: 'point',
										sizeField: 1
									}}
									grid={true}
									gridAreaFill="#000"
									smooth={true}
									// grid={{
									// 	left: '3%', // 网格左侧边距
									// 	right: '4%', // 网格右侧边距
									// 	bottom: '3%', // 网格底部边距
									// 	top: '10%', // 网格顶部边距
									// 	containLabel: true, // 是否包含坐标轴刻度标签在内
									// 	// 以下是可选的网格线样式配置
									// 	line: {
									// 		// style: {
									// 		fill: 'red',
									// 		fillOpacity: 0.5,
									// 		stroke: 'black',
									// 		lineWidth: 1,
									// 		lineDash: [4, 5],
									// 		strokeOpacity: 0.7,
									// 		shadowColor: 'black',
									// 		shadowBlur: 10,
									// 		shadowOffsetX: 5,
									// 		shadowOffsetY: 5,
									// 		cursor: 'pointer'
									// 		// }
									// 	}
									// }}
									lineStyle={{
										fill: 'red',
										fillOpacity: 0.5,
										stroke: 'black',
										lineWidth: 1,
										lineDash: [4, 5],
										strokeOpacity: 0.7,
										shadowColor: 'black',
										shadowBlur: 10,
										shadowOffsetX: 5,
										shadowOffsetY: 5,
										cursor: 'pointer'
									}}
									interaction={{
										tooltip: {
											marker: false
										}
									}}
									style={{
										lineWidth: 1
									}}
								/>
							</Col>
							<Col span={12}>
								<Line
									height={300}
									data={lineData}
									xField="x"
									yField="y"
									point={{
										shapeField: 'point',
										sizeField: 1
									}}
									interaction={{
										tooltip: {
											marker: false
										}
									}}
									style={{
										lineWidth: 1
									}}
								/>
							</Col>
						</Row>
						<Row>
							<Line
								data={lineData}
								xField="x"
								yField="y"
								point={{
									shapeField: 'point',
									sizeField: 1
								}}
								interaction={{
									tooltip: {
										marker: false
									}
								}}
								style={{
									lineWidth: 1
								}}
							/>
						</Row>
					</Card>
				</Col>
			</Row>
		</Card>
	);
};
export default Monitor;
