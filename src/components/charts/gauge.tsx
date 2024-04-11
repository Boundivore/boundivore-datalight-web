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
 * 仪表盘组件
 * @author Tracy.Guo
 */
import { useEffect, useState } from 'react';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import { Gauge } from '@ant-design/plots';

const GaugeComponent = ({ clusterId, query }) => {
	const [gaugeData, setGaugeData] = useState(0);
	const getGaugeData = async () => {
		const api = APIConfig.prometheus;
		const params = {
			Body: '',
			ClusterId: clusterId,
			Path: '/api/v1/query',
			QueryParamsMap: {
				query
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
	};
	useEffect(() => {
		getGaugeData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<Gauge
			// width={200}
			height={300}
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
	);
};
export default GaugeComponent;
