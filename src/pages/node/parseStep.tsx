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
 * ParseStep - 解析节点主机名步骤
 * @author Tracy.Guo
 */
import { forwardRef, useImperativeHandle, Ref } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';

const layout = {
	labelCol: { span: 8 },
	wrapperCol: { span: 16 }
};
const { TextArea } = Input;

type FieldType = {
	Hostname: string;
	SshPort: string;
};

interface MyComponentMethods {
	handleOk: () => void;
}
const ParseStep: React.FC = forwardRef((_props, ref: Ref<MyComponentMethods>) => {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const [form] = Form.useForm();
	useImperativeHandle(ref, () => ({
		handleOk
	}));
	const handleOk = async () => {
		const api = APIConfig.parseHostname;
		try {
			const values = await form.validateFields();
			const { Hostname, SshPort } = values;
			const data = await RequestHttp.post(api, { ClusterId: id, HostnameBase64: btoa(Hostname), SshPort });
			const validData = data.Data.ValidHostnameList;
			return Promise.resolve(validData);
			// 具体业务逻辑
		} catch (error) {
			return;
			// console.log(error);
		}
	};

	return (
		<Form form={form} name="basic" {...layout} style={{ maxWidth: 600 }} initialValues={{ SshPort: 22 }} autoComplete="off">
			<Form.Item<FieldType>
				label={t('node.hostName')}
				name="Hostname"
				rules={[{ required: true, message: t('node.hostnameCheck') }]}
			>
				<TextArea rows={4} />
			</Form.Item>
			<Form.Item<FieldType> label={t('node.port')} name="SshPort" rules={[{ required: true, message: t('node.portCheck') }]}>
				<Input />
			</Form.Item>
		</Form>
	);
});
export default ParseStep;
