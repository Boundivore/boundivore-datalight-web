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
import React, { useImperativeHandle, useEffect, useState, useRef, forwardRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form, Input, Collapse, Col, Button, Space, Result } from 'antd';
import { DoubleRightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import type { CollapseProps } from 'antd';
import useStore from '@/store/store';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import { ServiceItemType } from '@/api/interface';

const layout = {
	labelCol: { span: 8 },
	wrapperCol: { span: 16 }
};
const PreconfigStep: React.FC = forwardRef((_props, ref) => {
	const { t } = useTranslation();
	const [serviceList, setServiceList] = useState<ServiceItemType[]>([]);
	const [items, setItems] = useState([]);
	const [keys, setKeys] = useState<string[]>([]);
	const [cachedKeys, setCachedKeys] = useState<string[]>([]);
	const { setJobId } = useStore();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const [form] = Form.useForm();
	let serviceNameList = useRef<string[]>([]);
	useEffect(() => {
		const filterItems = serviceList.filter(item => item.PlaceholderInfoList.length);
		const updatedItems: CollapseProps['items'] = filterItems.map((service, serviceIndex) => ({
			key: `${serviceIndex}`,
			label: service.ServiceName,
			children: service.PlaceholderInfoList.map(
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
		}));
		const keysArr = updatedItems.map(item => String(item.key));
		setItems(updatedItems);
		setKeys(keysArr);
		setCachedKeys(keysArr); // 缓存 keys 副本

		// 在组件挂载时，根据原始数据初始化表单
		const initialValues = {};
		filterItems.forEach((service, serviceIndex) => {
			service.PlaceholderInfoList.forEach((info, infoIndex) => {
				info.ConfigPrePropertyList.forEach((property, propertyIndex) => {
					const formKey = `${service.ServiceName}_${serviceIndex}_${infoIndex}_${propertyIndex}`;
					initialValues[formKey] = property.Default || property.Value;
				});
			});
		});
		form.setFieldsValue(initialValues);
	}, [serviceList, form]);

	const onFinish = async () => {
		// 将表单数据回填到原始数据中
		if (serviceList.length) {
			const values = form.getFieldsValue();
			const updatedData = _.cloneDeep([...serviceList]);
			updatedData.forEach((service, serviceIndex) => {
				service.PlaceholderInfoList.forEach((info, infoIndex) => {
					info.ConfigPrePropertyList.forEach((property, propertyIndex) => {
						const formKey = `${service.ServiceName}_${serviceIndex}_${infoIndex}_${propertyIndex}`;
						// 回填时设置为Value属性，并保留 Default 属性
						property.Value = values[formKey];
					});
					info.PropertyList = info.ConfigPrePropertyList;
					delete info.ConfigPrePropertyList;
				});
			});
			// setServiceList(updatedData);
			const api = APIConfig.preconfigSave;
			const params = {
				ClusterId: id,
				ServiceList: updatedData
			};
			const data = await RequestHttp.post(api, params);
			return Promise.resolve(data);
		} else {
			return true; // 没有可修改的配置信息，无需保存，直接到下一步预览页
		}
	};
	// 获取预配置项
	const getPreconfigList = async () => {
		const api = APIConfig.preconfigList;
		const data = await RequestHttp.get(api, { params: { ClusterId: id } });
		const {
			Data: { ConfigPreServiceList }
		} = data;
		setServiceList(ConfigPreServiceList);
		ConfigPreServiceList.map((service: ServiceItemType) => {
			serviceNameList.current.push(service.ServiceName);
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
			ServiceNameList: [...new Set(serviceNameList.current)] // 数组去重
		};
		const data = await RequestHttp.post(api, params);
		setJobId(data.Data.JobId);
		return Promise.resolve(data);
	};
	const handleExpand = () => {
		setKeys(cachedKeys);
	};
	const handleUnexpand = () => {
		setKeys([]);
	};
	const handleChange = (keyArr: string[]) => {
		setKeys(keyArr);
	};
	useEffect(() => {
		getPreconfigList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<>
			{serviceList.length ? (
				<>
					<Col className="mb-[20px]" span={24}>
						<Space className="flex justify-end">
							<Button size="middle" icon={<DoubleRightOutlined rotate={90} />} onClick={handleExpand}>
								{t('expandAll')}
							</Button>
							<Button size="middle" icon={<DoubleRightOutlined rotate={270} />} onClick={handleUnexpand}>
								{t('unexpandAll')}
							</Button>
						</Space>
					</Col>
					<Form {...layout} form={form}>
						<Collapse items={items} activeKey={keys} onChange={keyArr => handleChange(keyArr)} />
					</Form>
				</>
			) : (
				<Result title={t('service.preconfigInfo')} />
			)}
		</>
	);
});
export default PreconfigStep;
