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
 * 新增告警接口处理方式
 * @author Tracy
 */
import { FC } from 'react';
import { t } from 'i18next';
import { Modal, Form, Input } from 'antd';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';

interface AddHandlerInterfaceModalProps {
	operation?: string;
	handlerId?: string;
	interfaceUri?: string;
	isModalOpen: boolean;
	handleCancel: () => void;
	callback: () => void;
}
interface ParamsType {
	InterfaceUri: string;
	HandlerId?: string; // 可选的，根据实际情况添加
}
const layout = {
	labelCol: { span: 4 },
	wrapperCol: { span: 20 }
};
const AddHandlerInterfaceModal: FC<AddHandlerInterfaceModalProps> = ({
	operation,
	handlerId,
	interfaceUri,
	isModalOpen,
	handleCancel,
	callback
}) => {
	const [form] = Form.useForm();
	const addHandlerInterface = () => {
		form.validateFields().then(async ({ InterfaceUri }) => {
			let api = APIConfig.newAlertHandlerInterface;
			let params: ParamsType = {
				InterfaceUri
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
			title={t(`alert.${operation === 'edit' ? 'editHandlerInterface' : 'addHandlerInterface'}`)}
			open={isModalOpen}
			onCancel={handleCancel}
			onOk={addHandlerInterface}
		>
			<Form form={form} {...layout} className="pt-[20px]" initialValues={{ InterfaceUri: interfaceUri }}>
				<Form.Item
					name="InterfaceUri"
					label={t('alert.interfaceUri')}
					rules={[{ required: true, message: t('alert.interfaceUriCheck') }]}
				>
					<Input />
				</Form.Item>
			</Form>
		</Modal>
	);
};
export default AddHandlerInterfaceModal;
