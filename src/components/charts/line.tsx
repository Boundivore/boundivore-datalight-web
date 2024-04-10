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
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import { Line } from '@ant-design/plots';
import { transformData } from '@/utils/helper';

const LineComponent = ({ clusterId, query }) => {
	const [lineData, setLineData] = useState([]);
	const getLineData = async () => {
		const api = APIConfig.prometheus;
		const params = {
			Body: '',
			ClusterId: clusterId,
			Path: '/api/v1/query_range',
			QueryParamsMap: {
				query,
				start: '1712652335.023',
				end: '1712652635.023',
				step: 14
			},
			RequestMethod: 'GET'
		};
		const { Data } = await RequestHttp.post(api, params);
		const formattedData = transformData(JSON.parse(Data).data.result[0].values);
		setLineData(formattedData);
	};
	useEffect(() => {
		getLineData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<Line
			height={250}
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
	);
};
export default LineComponent;
