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
 * AddUserModal - 新增用户
 * @author Tracy
 */

import { FC } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
// import type { FormProps } from 'antd';
import { t } from 'i18next';
import { md5 } from 'js-md5';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
type FieldType = {
	Principal?: string;
	Credential?: string;
};
interface AddUserModalProps {
	isModalOpen: boolean;
	handleCancel: () => void;
	handleOk: () => void;
}
const identityTypeData = [
	// { value: 'EMAIL', label: <span>EMAIL</span> },
	// { value: 'PHONE', label: <span>PHONE</span> },
	{ value: 'USERNAME', label: <span>用户名</span> }
];
const AddUserModal: FC<AddUserModalProps> = ({ isModalOpen, handleCancel, handleOk }) => {
	const [form] = Form.useForm();
	const [messageApi] = message.useMessage();

	const addUser = async () => {
		const values = form.getFieldsValue();
		console.log(values);
		const api = APIConfig.register;
		const params = {
			UserAuth: {
				Credential: md5(values.Credential),
				IdentityType: values.IdentityType,
				Principal: values.Principal
			},
			UserBase: {
				Avatar: '',
				Nickname: values.Nickname,
				Realname: values.Realname
			}
		};
		const { Code } = await RequestHttp.post(api, params);
		if (Code === '00000') {
			messageApi.success(t('messageSuccess'));
			handleOk(); // 刷新用户列表
			handleCancel(); // 关闭弹窗
		}
	};
	return (
		<Modal title={t('permission.addUser')} open={isModalOpen} onCancel={handleCancel} onOk={addUser}>
			<Form
				form={form}
				name="basic"
				labelCol={{ span: 4 }}
				wrapperCol={{ span: 20 }}
				style={{ maxWidth: 600 }}
				initialValues={{ IdentityType: 'USERNAME' }}
				autoComplete="off"
			>
				<Form.Item<FieldType>
					label={t('login.principal')}
					name="Principal"
					rules={[{ required: true, message: 'Please input your username!' }]}
				>
					<Input />
				</Form.Item>
				<Form.Item<FieldType>
					label={t('permission.identityType')}
					name="IdentityType"
					rules={[{ required: true, message: 'Please input your username!' }]}
				>
					<Select options={identityTypeData} />
				</Form.Item>

				<Form.Item<FieldType>
					label={t('login.credential')}
					name="Credential"
					rules={[{ required: true, message: 'Please input your password!' }]}
				>
					<Input.Password />
				</Form.Item>
				<Form.Item<FieldType>
					label={t('permission.realName')}
					name="Realname"
					rules={[{ required: true, message: 'Please input your password!' }]}
				>
					<Input />
				</Form.Item>
				<Form.Item<FieldType>
					label={t('permission.nickName')}
					name="Nickname"
					rules={[{ required: true, message: 'Please input your password!' }]}
				>
					<Input />
				</Form.Item>
			</Form>
		</Modal>
	);
};
export default AddUserModal;
