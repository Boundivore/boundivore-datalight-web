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

import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import { Modal, Form, Input } from 'antd';

/**
 * 新增告警邮箱处理方式
 * @author Tracy
 */
const AddHandlerMailModal = ({ isModalOpen, handleCancel }) => {
	const [form] = Form.useForm();
	const addHandlerMail = () => {
		form.validateFields().then(async ({ MailAccount }) => {
			const api = APIConfig.newAlertHandlerMail;
			const { Code } = await RequestHttp.post(api, { MailAccount });
			if (Code === '00000') {
				handleCancel && handleCancel();
			}
		});
	};
	return (
		<Modal open={isModalOpen} onCancel={handleCancel} onOk={addHandlerMail}>
			<Form form={form}>
				<Form.Item name="MailAccount">
					<Input />
				</Form.Item>
			</Form>
		</Modal>
	);
};
export default AddHandlerMailModal;
