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
import { Typography } from 'antd';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import { timestampToHoursAgo } from '@/utils/helper';
const { Title } = Typography;

const TextComponent = ({ clusterId, query, unit, type }) => {
	const [textData, setTextData] = useState();
	const getTextData = async () => {
		const api = APIConfig.prometheus;
		const params = {
			Body: '',
			ClusterId: clusterId,
			Path: '/api/v1/query',
			QueryParamsMap: {
				query
			},
			RequestMethod: 'GET'
		};
		const { Data } = await RequestHttp.post(api, params);
		const {
			data: { result }
		} = JSON.parse(Data);
		type === 'self' && setTextData(4);
		type === 'text' && setTextData(parseFloat(result[0].value[1]).toFixed(2));
		type === 'time' && setTextData(timestampToHoursAgo(result[0].value[1]));
		type === 'number' && setTextData(result[0].value[1]);
		type === 'byte' && setTextData((result[0].value[1] / 1024 / 1024 / 1024).toFixed(2));
		// if (type === 'number') {
		// 	const total = result.reduce((acc, item) => acc + parseInt(item.value[1]), 0);
		// 	setTextData(total);
		// }
	};
	useEffect(() => {
		getTextData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<Title level={3} className="text-blue-500 text-center">
			{textData}
			{unit}
		</Title>
	);
};
export default TextComponent;
