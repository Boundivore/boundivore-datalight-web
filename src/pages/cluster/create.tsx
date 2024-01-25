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
 * @author Tracy.Guo
 */
import { useEffect, useState } from 'react';
import { Card, Button, Form, Input, Tabs, List, Avatar, Select } from 'antd';
import { useTranslation, Trans } from 'react-i18next';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import { ClusterNewRequest } from '@/api/interface';
import useStore from '@/store/store';
import useNavigater from '@/hooks/useNavigater';

const { Option } = Select;

const layout = {
	labelCol: { span: 8 },
	wrapperCol: { span: 16 }
};

const CreateCluster: React.FC = () => {
	const { navigateToHome } = useNavigater();
	const [success, setSuccess] = useState(false);
	const [DLCVersion] = useState('');
	const [serviceList, setServiceList] = useState([]);
	const [showRelativeId, setShowRelativeId] = useState(false);
	const { jobClusterId, setJobClusterId } = useStore();
	const { t } = useTranslation();
	const [form] = Form.useForm();
	const handleOk = async () => {
		const api = APIConfig.createCluster;
		const values: ClusterNewRequest = await form.validateFields();
		const data = await RequestHttp.post(api, values);
		if (data.Code === '00000') {
			setSuccess(true);
			setJobClusterId(data.Data.ClusterId);
		}
	};
	const getDLCVersion = async () => {
		const api = APIConfig.getDLCVersion;
		const { Code, Data } = await RequestHttp.get(api);
		if (Code) {
			form.setFieldsValue({ DlcVersion: Data.DlcVersion });
			setServiceList(Data.DlcServiceSummaryList);
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
		<Card className="min-h-[calc(100%-100px)] m-[20px]" title={t('cluster.create')}>
			{!success ? (
				<Form
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
							<Option value="COMPUTE">{t('cluster.compute')}</Option>
							<Option value="MIXED">{t('cluster.mixed')}</Option>
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
						<Input />
					</Form.Item>
					<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
						<Tabs
							items={serviceList.map(service => {
								return {
									key: service.ServiceName,
									label: service.ServiceName,
									children: (
										<List
											itemLayout="horizontal"
											dataSource={service.DependencyList}
											renderItem={(item, index) => (
												<List.Item>
													<List.Item.Meta
														avatar={<Avatar src={`https://xsgames.co/randomusers/avatar.php?g=pixel&key=${index}`} />}
														title={<a href="https://ant.design">{item.title}</a>}
														description="Ant Design, a design language for background applications, is refined by Ant UED Team"
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
							rules={[{ required: true, message: `${t('cluster.desCheck')}` }]}
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
				<div style={{ fontSize: '40px', textAlign: 'center' }}>
					<p>
						<Trans i18nKey="cluster.createSucc">
							This should be a <a href={`/node/init?id=${jobClusterId}`}>link</a>
						</Trans>
					</p>
					<Button type="primary" onClick={navigateToHome}>
						{t('cluster.backToList')}
					</Button>
				</div>
			)}
		</Card>
	);
};

export default CreateCluster;
