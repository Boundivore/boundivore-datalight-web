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
import { useEffect, useState } from 'react';
import { Typography } from 'antd';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import { timestampToHoursAgo } from '@/utils/helper';
import useStore from '@/store/store';

const { Title } = Typography;
const regexInstance = new RegExp('{instance}', 'g');
const regexJobName = new RegExp('{jobName}', 'g');
const TextComponent = ({ clusterId, query, unit, type, name }) => {
	const [textData, setTextData] = useState();
	const { jobName, instance } = useStore();

	const getTextData = async () => {
		let api, params;
		// type 为self 是定制类型， 根据name来定制api和参数
		if (type === 'self') {
			if (name === 'nodeCount') {
				api = APIConfig.nodeList;
				params = { ClusterId: clusterId };
			} else if (name === 'serviceCount') {
				api = APIConfig.serviceList;
				params = { ClusterId: clusterId };
			}
		} else {
			api = APIConfig.prometheus;
			params = {
				Body: '',
				ClusterId: clusterId,
				Path: '/api/v1/query',
				QueryParamsMap: {
					query: query.replace(regexInstance, instance).replace(regexJobName, jobName)
				},
				RequestMethod: 'GET'
			};
		}

		if (api && params) {
			const { Data } = await (type === 'self' ? RequestHttp.get(api, { params }) : RequestHttp.post(api, params));

			if (type === 'self') {
				if (name === 'nodeCount') {
					setTextData(Data.NodeDetailList.length);
				} else if (name === 'serviceCount') {
					const count = Data.ServiceSummaryList.filter(service => service.SCStateEnum === 'DEPLOYED').length;
					setTextData(count);
				}
			} else {
				const {
					data: { result }
				} = JSON.parse(Data);
				switch (type) {
					case 'text':
						setTextData(parseFloat(result[0].value[1]).toFixed(2));
						break;
					case 'time':
						setTextData(timestampToHoursAgo(result[0].value[1]));
						break;
					case 'number':
						setTextData(result[0].value[1]);
						break;
					case 'byte':
						setTextData((parseFloat(result[0].value[1]) / 1024).toFixed(2));
						break;
					default:
						break;
				}
			}
		}
	};
	useEffect(() => {
		getTextData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [jobName, instance]);
	return (
		<Title level={3} className="text-blue-500 text-center">
			{textData}
			{unit}
		</Title>
	);
};
export default TextComponent;
