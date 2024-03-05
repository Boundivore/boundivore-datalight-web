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
 * PreviewconfigStep - 预览配置
 * @author Tracy.Guo
 */
import React, { useImperativeHandle, useEffect, useRef, forwardRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Space } from 'antd';
// import { useTranslation } from 'react-i18next';
// import _ from 'lodash';
import useStore from '@/store/store';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';

const PreviewconfigStep: React.FC = forwardRef((_props, ref) => {
	// const { t } = useTranslation();
	// const [serviceList, setServiceList] = useState([]);
	const { setJobId } = useStore();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	let serviceNameList = useRef<string[]>([]);

	// 获取预配置项
	const getPreconfigList = async () => {
		const api = APIConfig.preconfigList;
		const data = await RequestHttp.get(api, { params: { ClusterId: id } });
		const {
			Data: { ConfigPreServiceList }
		} = data;
		// setServiceList(ConfigPreServiceList);
		ConfigPreServiceList.map(service => {
			serviceNameList.current.push(service.ServiceName);
		});
	};
	useImperativeHandle(ref, () => ({
		handleOk
	}));

	const handleOk = async () => {
		const api = APIConfig.deploy;
		const params = {
			ActionTypeEnum: 'DEPLOY',
			ClusterId: id,
			IsOneByOne: false,
			ServiceNameList: [...new Set(serviceNameList.current)] // 数组去重
		};
		const data = await RequestHttp.post(api, params);
		setJobId(data.Data.JobId);
		return Promise.resolve(data);
	};

	useEffect(() => {
		getPreconfigList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Space direction="vertical" size={16}>
			<Card title="Default size card" extra={<a href="#">More</a>} style={{ width: 300 }}>
				<p>Card content</p>
				<p>Card content</p>
				<p>Card content</p>
			</Card>
			<Card size="small" title="Small size card" extra={<a href="#">More</a>} style={{ width: 300 }}>
				<p>Card content</p>
				<p>Card content</p>
				<p>Card content</p>
			</Card>
		</Space>
	);
});
export default PreviewconfigStep;
