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
 * ParseStep - 解析节点主机名步骤, 第一步
 * @author Tracy.Guo
 */
import { useEffect, useImperativeHandle } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import useStore, { usePersistStore } from '@/store/store';
import { ParseHostnameType } from '@/api/interface';

const layout = {
	labelCol: { span: 8 },
	wrapperCol: { span: 16 }
};
const { TextArea } = Input;

const stepName = 'parseStep';

const ParseStep: React.ForwardRefRenderFunction<{ handleOk: () => void } | null, any> = (_props, ref) => {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const { setCurrentPageDisabled } = useStore();
	const {
		userInfo: { userId }
	} = usePersistStore();
	const id = searchParams.get('id');
	const [form] = Form.useForm();
	useImperativeHandle(ref, () => ({
		handleOk
	}));
	const handleOk = async () => {
		// const api = APIConfig.parseHostname;
		// try {
		// 	const values = await form.validateFields();
		// 	const { Hostname, SshPort } = values;
		// 	const data = await RequestHttp.post(api, { ClusterId: id, HostnameBase64: btoa(Hostname), SshPort });
		// 	const validData = data.Data.ValidHostnameList;
		// 	return Promise.resolve(validData);
		// } catch (error) {
		// 	return Promise.reject(error);
		// }
		const api = APIConfig.webStateSave;
		try {
			const values = await form.validateFields();
			const data = await RequestHttp.post(api, {
				ClusterId: id,
				UserId: userId,
				WebKey: stepName,
				WebValue: btoa(JSON.stringify(values))
			});
			return Promise.resolve(data.Code === '00000');
		} catch (error) {
			return Promise.reject(error);
		}
	};
	const getWebState = async () => {
		const api = APIConfig.webStateGet;
		const params = {
			ClusterId: id,
			UserId: userId,
			WebKey: stepName
		};
		const data = await RequestHttp.get(api, { params });
		const {
			Data: {
				KVMap: { parseStep }
			}
		} = data;
		form.setFieldsValue(JSON.parse(atob(parseStep)));
		console.log(111, JSON.parse(atob(data.Data.KVMap.parseStep)));
		// return Promise.resolve(data.Data);
	};
	useEffect(() => {
		setCurrentPageDisabled({ next: false });
		getWebState();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Form form={form} name="basic" {...layout} style={{ maxWidth: 600 }} initialValues={{ SshPort: 22 }} autoComplete="off">
			<Form.Item<ParseHostnameType>
				label={t('node.hostName')}
				name="Hostname"
				rules={[{ required: true, message: t('node.hostnameCheck') }]}
			>
				<TextArea rows={4} />
			</Form.Item>
			<Form.Item<ParseHostnameType>
				label={t('node.port')}
				name="SshPort"
				rules={[{ required: true, message: t('node.portCheck') }]}
			>
				<Input />
			</Form.Item>
		</Form>
	);
};
export default ParseStep;
