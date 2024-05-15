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
 * 新增告警邮箱处理方式
 * @author Tracy
 */
import { FC } from 'react';
import { t } from 'i18next';
import { Modal, Form, Input } from 'antd';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';

interface AddHandlerMailModalProps {
	operation?: string;
	handlerId?: string;
	mailAccount?: string;
	isModalOpen: boolean;
	handleCancel: () => void;
	callback: () => void;
}
interface ParamsType {
	MailAccount: string;
	HandlerId?: string; // 可选的，根据实际情况添加
}
const layout = {
	labelCol: { span: 4 },
	wrapperCol: { span: 20 }
};
const AddHandlerMailModal: FC<AddHandlerMailModalProps> = ({
	operation,
	handlerId,
	mailAccount,
	isModalOpen,
	handleCancel,
	callback
}) => {
	const [form] = Form.useForm();
	const addHandlerMail = () => {
		form.validateFields().then(async ({ MailAccount }) => {
			let api = APIConfig.newAlertHandlerMail;
			let params: ParamsType = {
				MailAccount
			};
			if (operation === 'edit') {
				api = APIConfig.updateAlertHandlerMail;
				params = {
					...params,
					HandlerId: handlerId
				};
			}
			const { Code } = await RequestHttp.post(api, params);
			if (Code === '00000') {
				handleCancel && handleCancel();
				callback && callback();
			}
		});
	};

	return (
		<Modal
			title={t(`alert.${operation === 'edit' ? 'editHandlerMail' : 'addHandlerMail'}`)}
			open={isModalOpen}
			onCancel={handleCancel}
			onOk={addHandlerMail}
		>
			<Form form={form} {...layout} className="pt-[20px]" initialValues={{ MailAccount: mailAccount }}>
				<Form.Item name="MailAccount" label={t('alert.mailAccount')} rules={[{ required: true, message: t('alert.mailCheck') }]}>
					<Input />
				</Form.Item>
			</Form>
		</Modal>
	);
};
export default AddHandlerMailModal;
