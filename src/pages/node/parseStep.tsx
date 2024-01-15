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
import { useState, forwardRef, useImperativeHandle } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';
// import InitNodeList from './initList';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
// import useStore from '@/store/store';

const layout = {
	labelCol: { span: 8 },
	wrapperCol: { span: 16 }
};
const { TextArea } = Input;

type FieldType = {
	Hostname: string;
	SshPort: string;
};

const ParseStep: React.FC = forwardRef((props, ref) => {
	const [showForm] = useState(true);
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const [form] = Form.useForm();
	useImperativeHandle(ref, () => ({
		handleOk
	}));
	const handleOk = async () => {
		const api = APIConfig.parseHostname;
		const values = await form.validateFields();
		const { Hostname, SshPort } = values;
		const data = await RequestHttp.post(api, { ClusterId: id, HostnameBase64: btoa(Hostname), SshPort });
		const validData = data.Data.ValidHostnameList;
		// validData.map((item: string) => ({
		// 	Hostname: item
		// }));
		// setParsedList(validData);
		return Promise.resolve(validData);
		// errorInfo => {
		// 	console.log('Failed:', errorInfo);
		// }
		// );
	};

	return (
		<>
			{
				showForm ? (
					<Form
						form={form}
						name="basic"
						{...layout}
						style={{ maxWidth: 600 }}
						initialValues={{ SshPort: 22 }}
						// onFinish={onFinish}
						// onFinishFailed={onFinishFailed}
						autoComplete="off"
					>
						<Form.Item<FieldType>
							label={t('node.hostName')}
							name="Hostname"
							rules={[{ required: true, message: t('node.hostnameCheck') }]}
						>
							<TextArea rows={4} />
						</Form.Item>
						<Form.Item<FieldType>
							label={t('node.port')}
							name="SshPort"
							rules={[{ required: true, message: t('node.portCheck') }]}
						>
							<Input />
						</Form.Item>
					</Form>
				) : null
				// <InitNodeList data={ListData} />
			}
		</>
	);
});
export default ParseStep;
