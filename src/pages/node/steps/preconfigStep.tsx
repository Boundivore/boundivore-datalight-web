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
 * PreconfigStep - 预配置步骤
 * @author Tracy.Guo
 */
import React, { forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form, Input, Card } from 'antd';
import _ from 'lodash';
// import type { CollapseProps } from 'antd';
import useStore from '@/store/store';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import DeployOverviewModal from '../components/deployOverviewModal';

const layout = {
	labelCol: { span: 8 },
	wrapperCol: { span: 16 }
};
const PreconfigStep: React.FC = forwardRef((_props, ref) => {
	const [serviceList, setServiceList] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { setJobId } = useStore();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const [form] = Form.useForm();
	let serviceNameList: string[] = [];

	useEffect(() => {
		// 在组件挂载时，根据原始数据初始化表单
		const initialValues = {};
		serviceList.forEach((service, serviceIndex) => {
			service.PlaceholderInfoList.forEach((info, infoIndex) => {
				info.ConfigPrePropertyList.forEach((property, propertyIndex) => {
					const formKey = `${service.ServiceName}_${serviceIndex}_${infoIndex}_${propertyIndex}`;
					initialValues[formKey] = property.Default || property.Value;
				});
			});
		});
		form.setFieldsValue(initialValues);
	}, [serviceList, form]);

	const onFinish = async (openModal: boolean) => {
		// 将表单数据回填到原始数据中
		const values = form.getFieldsValue();
		const updatedData = _.cloneDeep([...serviceList]);
		updatedData.forEach((service, serviceIndex) => {
			service.PlaceholderInfoList.forEach((info, infoIndex) => {
				info.ConfigPrePropertyList.forEach((property, propertyIndex) => {
					const formKey = `${service.ServiceName}_${serviceIndex}_${infoIndex}_${propertyIndex}`;
					// 回填时设置为Value属性，删除 Default 属性
					property.Value = values[formKey];
					// delete property.Default;
				});
				info.PropertyList = info.ConfigPrePropertyList;
				delete info.ConfigPrePropertyList;
			});
		});
		// setServiceList(updatedData);
		openModal && setIsModalOpen(true);
		const api = APIConfig.preconfigSave;
		const params = {
			ClusterId: id,
			ServiceList: updatedData
		};
		const data = await RequestHttp.post(api, params);
		return Promise.resolve(data);
	};
	// 获取预配置项
	const getPreconfigList = async () => {
		const api = APIConfig.preconfigList;
		const data = await RequestHttp.get(api, { params: { ClusterId: id } });
		const {
			Data: { ConfigPreServiceList }
		} = data;
		setServiceList(ConfigPreServiceList);
		ConfigPreServiceList.map(service => {
			serviceNameList.push(service.ServiceName);
		});
	};
	useImperativeHandle(ref, () => ({
		handleOk,
		onFinish
	}));

	const handleOk = async () => {
		const api = APIConfig.deploy;
		const params = {
			ActionTypeEnum: 'DEPLOY',
			ClusterId: id,
			IsOneByOne: false,
			ServiceNameList: serviceNameList.length ? serviceNameList : ['MONITOR', 'ZOOKEEPER', 'HDFS', 'YARN']
		};
		await onFinish(false);
		const data = await RequestHttp.post(api, params);
		setJobId(data.Data.JobId);
		return Promise.resolve(data);
	};
	const handleModalCancel = () => {
		setIsModalOpen(false);
	};
	useEffect(() => {
		getPreconfigList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			<Form {...layout} form={form}>
				{serviceList?.map((service, serviceIndex) => (
					<Card title={service.ServiceName}>
						{service.PlaceholderInfoList?.map(
							(info, infoIndex) =>
								info.ConfigPrePropertyList?.map((property, propertyIndex) => (
									<Form.Item
										label={property.Describe}
										name={`${service.ServiceName}_${serviceIndex}_${infoIndex}_${propertyIndex}`}
										key={`${service.ServiceName}_${serviceIndex}_${infoIndex}_${propertyIndex}`}
									>
										<Input placeholder={property.Placeholder} />
									</Form.Item>
								))
						)}
					</Card>
				))}
			</Form>
			{isModalOpen ? <DeployOverviewModal isModalOpen={isModalOpen} handleCancel={handleModalCancel} /> : null}
		</>
	);
});

export default PreconfigStep;
