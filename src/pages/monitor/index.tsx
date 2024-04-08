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
import { Table, Card, Row, Col } from 'antd';
// import RequestHttp from '@/api';
// import APIConfig from '@/api/config';
import useStore from '@/store/store';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
// import { Gauge } from '@ant-design/charts';
import { Gauge } from '@ant-design/plots';

// import { Gauge } from '@antv/g2plot';

const Monitor = () => {
	const { t } = useTranslation();
	const { monitorItems } = useStore();
	const [activeComponent, setActiveComponent] = useState(monitorItems[0].uid);

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
	const getGaugeData = () => {
		const api = APIConfig.prometheus;
		const params = {
			Body: '',
			ClusterId: '1775417669466292226',
			Path: '/api/v1/query',
			QueryParamsMap: {
				// query: 'Hadoop_DataNode_capacity{name="FsDatasetstate", instance="node01:17005"}',
				// query:
				// 	'sum(jvm_memory_used_bytes{job="DATALIGHT-Master", instance=~"node01:8001", area="heap"})*100/sum(jvm_memory_max_bytes{job="DATALIGHT-Master", instance=~"node01:8001", area="heap"})',
				query:
					'sum(jvm_memory_used_bytes{job="DATALIGHT-Master", instance=~"node01:8001", area="nonheap"})*100/sum(jvm_memory_max_bytes{job="DATALIGHT-Master", instance=~"node01:8001", area="nonheap"})'
				// time: '1712128729.98'
			},
			RequestMethod: 'GET'
		};
		RequestHttp.post(api, params);
	};
	const getLineData = async () => {
		const api = APIConfig.prometheus;
		const params = {
			Body: '',
			ClusterId: '1775417669466292226',
			Path: '/api/v1/query_range',
			QueryParamsMap: {
				query: 'system_cpu_usage{job="DATALIGHT-Master", instance=~"node01:8001"}',
				start: '1712570069.456',
				end: '1712573669.456',
				step: 14
			},
			RequestMethod: 'GET'
		};
		const { Data } = await RequestHttp.post(api, params);
		console.log(1111111, JSON.parse(Data));
	};
	const gaugeData = {
		width: 360,
		height: 360,
		autoFit: true,
		data: {
			target: 48,
			total: 100,
			name: 'score'
		},
		legend: false,
		style: {
			textContent: target => `${target}%`
		}
	};
	useEffect(() => {
		getGaugeData();
		getLineData();
	}, []);
	return (
		<Card className="min-h-[calc(100%-100px)] m-[20px]">
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
						<Row className="mt-[20px]">
							<Col span={12}>
								<span>heap</span>
								<Gauge {...gaugeData} />
							</Col>
							<Col span={12}>
								<span>non-heap</span>
								<Gauge {...gaugeData} />
							</Col>
						</Row>
					</Card>
				</Col>
			</Row>
		</Card>
	);
};
export default Monitor;
