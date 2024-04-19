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
 * 折线图组件
 * @author Tracy.Guo
 */
import { useEffect, useState } from 'react';
import { Empty } from 'antd';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import ReactECharts from 'echarts-for-react';
import useStore from '@/store/store';
import dayjs from 'dayjs';
const regexInstance = new RegExp('{instance}', 'g');
const regexJobName = new RegExp('{jobName}', 'g');
const baseOptions = {
	tooltip: {
		trigger: 'axis'
	},
	xAxis: {
		type: 'category',
		boundaryGap: false,
		data: []
	},
	yAxis: {
		type: 'value'
	},
	series: []
};
const LineComponent = ({ clusterId, query, multiple }) => {
	const { monitorStartTime, monitorEndTime, jobName, instance } = useStore();
	const defaultOptions = {
		...baseOptions,
		...(multiple ? { legend: { data: [] } } : {})
	};
	const [option, setOption] = useState(defaultOptions);
	const getLineData = async () => {
		const api = APIConfig.prometheus;
		const params = {
			Body: '',
			ClusterId: clusterId,
			Path: '/api/v1/query_range',
			QueryParamsMap: {
				query: query.replace(regexInstance, instance).replace(regexJobName, jobName),
				start: (monitorStartTime / 1000).toString(),
				end: (monitorEndTime / 1000).toString(),
				step: 14
			},
			RequestMethod: 'GET'
		};

		const { Data } = await RequestHttp.post(api, params);
		const lineData = JSON.parse(Data).data.result;
		// 提取图例数据
		const legendData = lineData.map(item => item.metric.device || item.metric.mountpoint);

		// 提取 x 轴数据
		const xAxisData = lineData[0].values.map(item => dayjs.unix(item[0]).format('HH:mm'));

		// 提取 series 数据
		const seriesData = lineData.map(item => {
			const data = item.values.map(value => parseFloat(value[1])); // 将字符串转换为数字
			let seriesItem = {
				type: 'line',
				data: data
			};

			if (multiple) {
				seriesItem = { ...seriesItem, name: item.metric.device || item.metric.mountpoint };
			}
			return seriesItem;
		});

		const updatedOption = { ...option };
		multiple && (updatedOption.legend.data = legendData);
		updatedOption.xAxis.data = xAxisData;
		updatedOption.series = seriesData;
		setOption(updatedOption);
	};
	useEffect(() => {
		getLineData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [monitorStartTime, monitorEndTime, jobName, instance]);

	return option.series.length ? <ReactECharts option={option} /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />;
};
export default LineComponent;
