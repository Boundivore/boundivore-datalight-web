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
import React, { forwardRef, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form, Input, Button } from 'antd';
// import { useTranslation } from 'react-i18next';
// import type { CollapseProps } from 'antd';
// import useStore, { useComponentAndNodeStore } from '@/store/store';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import DeployOverviewModal from './components/deployOverviewModal';

const layout = {
	labelCol: { span: 8 },
	wrapperCol: { span: 16 }
};
const PreconfigStep: React.FC = forwardRef(() => {
	const [serviceList, setServiceList] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const [form] = Form.useForm();

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

	const onFinish = async values => {
		// 将表单数据回填到原始数据中
		const updatedData = [...serviceList];
		updatedData.forEach((service, serviceIndex) => {
			service.PlaceholderInfoList.forEach((info, infoIndex) => {
				info.ConfigPrePropertyList.forEach((property, propertyIndex) => {
					const formKey = `${service.ServiceName}_${serviceIndex}_${infoIndex}_${propertyIndex}`;
					// 回填时设置为Value属性，删除 Default 属性
					property.Value = values[formKey];
					delete property.Default;
				});
			});
		});
		setServiceList(updatedData);
		setIsModalOpen(true);
		const api = APIConfig.preconfigSave;
		const data = await RequestHttp.post(api, updatedData);
		console.log(9999, data);
	};
	// 获取预配置项
	const getPreconfigList = async () => {
		const api = APIConfig.preconfigList;
		const data = await RequestHttp.get(api, { params: { ClusterId: id } });
		setServiceList(data.Data.ConfigPreServiceList);
	};
	const handleModalOk = async () => {
		const api = APIConfig.deploy;
		const params = {
			ActionTypeEnum: 'DEPLOY',
			ClusterId: id,
			IsOneByOne: false,
			ServiceNameList: ['MONITOR', 'ZOOKEEPER', 'HDFS', 'YARN']
		};
		const data = await RequestHttp.post(api, params);
		console.log(888, data);
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
			<Form {...layout} form={form} onFinish={onFinish}>
				{serviceList?.map(
					(service, serviceIndex) =>
						service.PlaceholderInfoList?.map(
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
						)
				)}
				<Form.Item>
					<Button type="primary" htmlType="submit">
						Submit
					</Button>
				</Form.Item>
			</Form>
			{isModalOpen ? (
				<DeployOverviewModal isModalOpen={isModalOpen} handleOk={handleModalOk} handleCancel={handleModalCancel} />
			) : null}
		</>
	);
});

export default PreconfigStep;
