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
 * @author Tracy
 */
import { FC, useEffect, useState } from 'react';
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
	grid: {
		left: '15%' // 调整这个属性来加宽左侧空间
		// 其他grid属性...
	},
	xAxis: {
		type: 'category',
		boundaryGap: false,
		data: []
	},
	yAxis: {
		type: 'value',
		axisLine: {
			lineStyle: {
				type: 'dashed'
				// ...
			}
		},
		axisLabel: {}
	},
	series: [],
	legend: {}
};
interface LineComponentProps {
	clusterId: string;
	query: string;
	multiple: boolean;
	formatter: {
		formatterType: string;
		formatterCount: number;
		unit: string;
	};
	title: string;
}
interface SeriesItem {
	type: string;
	data: any;
	tooltip: {
		valueFormatter: (value: any) => string;
	};
	name?: string;
}
const LineComponent: FC<LineComponentProps> = ({ clusterId, query, multiple, formatter, title }) => {
	const { monitorStartTime, monitorEndTime, jobName, instance } = useStore();
	const defaultOptions = {
		...baseOptions,
		legend: {
			...(multiple ? { data: [] } : {})
		}
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
		const legendData = lineData.map((item: any) => item.metric.device || item.metric.mountpoint);

		// 提取 x 轴数据
		const xAxisData = lineData[0]?.values.map((item: any) => dayjs.unix(item[0]).format('HH:mm'));

		// 提取 series 数据
		const seriesData = lineData.map((item: any) => {
			const data = item.values.map((value: any) => parseFloat(value[1])); // 将字符串转换为数字
			let seriesItem: SeriesItem = {
				type: 'line',
				data: data,
				tooltip: { valueFormatter: (value: any) => parseFloat(value).toFixed(2) }
			};

			if (multiple) {
				seriesItem = { ...seriesItem, name: item.metric.device || item.metric.mountpoint };
			}
			return seriesItem;
		});

		const updatedOption = { ...option };
		if (multiple) {
			updatedOption.legend.data = legendData;
		}

		updatedOption.xAxis.data = xAxisData;
		if (formatter) {
			updatedOption.yAxis = {
				...updatedOption.yAxis,
				axisLabel: {
					formatter: (value: number) => {
						if (formatter.formatterCount && formatter.formatterType && formatter.unit) {
							const { formatterCount, formatterType, unit } = formatter;
							// 在这里进行单位换算，例如将原始数值除以1000并添加单位
							let expression;

							switch (formatterType) {
								case '*':
									expression = value * formatterCount;
									break;
								case '/':
									expression = value / formatterCount;
									break;
								default:
									expression = value;
							}
							return expression + unit;
						} else {
							// 如果格式化所需的参数不完整，则直接返回原始值
							return value;
						}
					}
				}
			};
		}

		updatedOption.series = seriesData;
		setOption(updatedOption);
	};

	useEffect(() => {
		getLineData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [monitorStartTime, monitorEndTime, jobName, instance]);

	return option.series.length ? (
		<ReactECharts option={option} style={{ width: '450', height: '300px' }} key={title} />
	) : (
		<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
	);
};
export default LineComponent;
