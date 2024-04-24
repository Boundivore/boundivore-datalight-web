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
import { Modal, Form, Input } from 'antd';
// import type { FormProps } from 'antd';
import { t } from 'i18next';
type FieldType = {
	username?: string;
	password?: string;
};
const AddUserModal: FC = ({ isModalOpen, handleCancel }) => {
	return (
		<Modal title={t('permission.addUser')} open={isModalOpen} onCancel={handleCancel}>
			<Form
				name="basic"
				labelCol={{ span: 8 }}
				wrapperCol={{ span: 16 }}
				style={{ maxWidth: 600 }}
				initialValues={{ remember: true }}
				autoComplete="off"
			>
				<Form.Item<FieldType>
					label="Principal"
					name="Principal"
					rules={[{ required: true, message: 'Please input your username!' }]}
				>
					<Input />
				</Form.Item>

				<Form.Item<FieldType>
					label="Password"
					name="password"
					rules={[{ required: true, message: 'Please input your password!' }]}
				>
					<Input.Password />
				</Form.Item>
				<Form.Item<FieldType>
					label="RealName"
					name="password"
					rules={[{ required: true, message: 'Please input your password!' }]}
				>
					<Input.Password />
				</Form.Item>
			</Form>
		</Modal>
	);
};
export default AddUserModal;
