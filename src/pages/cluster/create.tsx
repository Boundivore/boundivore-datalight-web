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
 * 新建集群
 * @author Tracy
 */
import { useEffect, useState } from 'react';
import { Button, Form, Input, Select, List, Tabs, Result } from 'antd';
import { useTranslation } from 'react-i18next';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import useStore from '@/store/store';
import useNavigater from '@/hooks/useNavigater';
import { ClusterType, ServiceItemType } from '@/api/interface';
import ContainerCard from '@/components/containerCard';

const { Option } = Select;

const layout = {
	labelCol: { span: 8 },
	wrapperCol: { span: 16 }
};

const CreateCluster: React.FC = () => {
	const { navigateToClusterList, navigateToNodeInit } = useNavigater();
	const [success, setSuccess] = useState(false);
	const [DLCVersion] = useState('');
	const [serviceList, setServiceList] = useState<ServiceItemType[]>([]);
	const [showRelativeId, setShowRelativeId] = useState(false);
	const { jobClusterId, setJobClusterId } = useStore();
	const { t } = useTranslation();
	const [form] = Form.useForm();
	const handleOk = async () => {
		const api = APIConfig.createCluster;
		const values: ClusterType = await form.validateFields();
		const data = await RequestHttp.post(api, values);
		if (data.Code === '00000') {
			setSuccess(true);
			setJobClusterId(data.Data.ClusterId);
		}
	};
	const getDLCVersion = async () => {
		const api = APIConfig.getDLCVersion;
		const {
			Code,
			Data: { DlcVersion, DlcServiceSummaryList }
		} = await RequestHttp.get(api);
		if (Code) {
			form.setFieldsValue({ DlcVersion: DlcVersion });
			const processedData = DlcServiceSummaryList.reduce((result: ServiceItemType, item: ServiceItemType) => {
				const serviceType = item.ServiceType;
				const serviceName = item.ServiceName;
				const version = item.Version;
				const desc = item.Desc;
				const existingItem = result.find((obj: ServiceItemType) => obj.ServiceType === serviceType);

				if (existingItem) {
					existingItem.Service.push({ ServiceName: serviceName, Version: version, Desc: desc });
				} else {
					result.push({
						ServiceType: serviceType,
						Service: [{ ServiceName: serviceName, Version: version, Desc: desc }]
					});
				}

				return result;
			}, []);
			setServiceList(processedData);
		}
	};
	const handleTypeChange = (type: string) => {
		setShowRelativeId(type === 'COMPUTE');
	};
	useEffect(() => {
		getDLCVersion();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<ContainerCard>
			{!success ? (
				<Form
					className="pt-[50px]"
					form={form}
					name="basic"
					{...layout}
					style={{ maxWidth: 600 }}
					initialValues={{ remember: true, DlcVersion: DLCVersion }}
					autoComplete="off"
				>
					<Form.Item
						label={t('cluster.name')}
						name="ClusterName"
						rules={[{ required: true, message: `${t('cluster.nameCheck')}` }]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						label={t('cluster.type')}
						name="ClusterType"
						rules={[{ required: true, message: `${t('cluster.typeCheck')}` }]}
					>
						<Select onChange={value => handleTypeChange(value)} allowClear>
							<Option key="MIXED" value="MIXED">
								{t('cluster.mixed')}
							</Option>
							<Option key="COMPUTE" value="COMPUTE">
								{t('cluster.compute')}
							</Option>
						</Select>
					</Form.Item>
					<Form.Item
						label={t('cluster.description')}
						name="ClusterDesc"
						rules={[{ required: true, message: `${t('cluster.desCheck')}` }]}
					>
						<Input />
					</Form.Item>
					<Form.Item
						label={t('cluster.dlcVersion')}
						name="DlcVersion"
						rules={[{ required: true, message: `${t('cluster.desCheck')}` }]}
					>
						<Input disabled />
					</Form.Item>
					<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
						<Tabs
							items={serviceList.map(service => {
								return {
									key: service.ServiceType,
									label: t(service.ServiceType.toLowerCase()),
									children: (
										<List
											size="small"
											itemLayout="horizontal"
											dataSource={service.Service}
											renderItem={(item: ServiceItemType) => (
												<List.Item>
													<List.Item.Meta
														title={
															<div>
																<p className="flex items-center">
																	<img src={`/service_logo/${item.ServiceName.toLowerCase()}.svg`} width="16" height="16" />
																	<span className="pl-[5px]">
																		{item.ServiceName}-V{item.Version}
																	</span>
																</p>
																<p className="text-stone-500">{item.Desc}</p>
															</div>
														}
													/>
												</List.Item>
											)}
										/>
									)
								};
							})}
						/>
					</Form.Item>
					{showRelativeId ? (
						<Form.Item
							label={t('cluster.relativeClusterId')}
							name="RelativeClusterId"
							rules={[{ required: true, message: `${t('cluster.idCheck')}` }]}
						>
							<Input />
						</Form.Item>
					) : null}
					<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
						<Button type="primary" size={'large'} onClick={handleOk}>
							{t('cluster.create')}
						</Button>
					</Form.Item>
				</Form>
			) : (
				<div style={{ fontSize: '30px', textAlign: 'center' }}>
					{/* <Trans i18nKey="cluster.createSucc">
							This should be a <a href={`/node/init?id=${jobClusterId}`}>link</a>
						</Trans> */}
					<Result
						status="success"
						title={t('cluster.createSucc')}
						extra={[
							<Button key="continue" type="primary" onClick={() => navigateToNodeInit(jobClusterId)}>
								{t('cluster.continue')}
							</Button>,
							<Button key="backToList" type="primary" onClick={navigateToClusterList}>
								{t('cluster.backToList')}
							</Button>
						]}
					/>
				</div>
			)}
		</ContainerCard>
	);
};

export default CreateCluster;
