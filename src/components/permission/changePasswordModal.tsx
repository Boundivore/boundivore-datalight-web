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
 * 修改密码
 * @author Tracy
 */
import { Form, Input, App, Modal, message } from 'antd';
import { md5 } from 'js-md5';
import { useTranslation } from 'react-i18next';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import { UserInfoVo } from '@/api/interface';

interface ChangePasswordFormValues {
	Principal: string;
	OldCredential: string;
	NewCredential: string;
	ConfirmNewCredential: string;
}

interface ChangePasswordModalProps {
	isModalOpen: boolean;
	user: UserInfoVo;
	handleCancel: () => void;
	handleOk?: () => void;
}
const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isModalOpen, user, handleCancel }) => {
	const { t } = useTranslation();
	const { modal } = App.useApp();
	const [form] = Form.useForm();
	const [messageApi, contextHolder] = message.useMessage();

	const onFinish = async () => {
		const values = form.getFieldsValue();
		const { NewCredential, OldCredential, Principal, ConfirmNewCredential } = values;
		const api = APIConfig.changePassword;
		if (NewCredential !== ConfirmNewCredential) {
			modal.error({
				title: t('error'),
				content: t('account.passwordMismatch'),
				okText: t('ok')
			});
			return;
		}
		const params = {
			NewCredential: md5(NewCredential),
			OldCredential: md5(OldCredential),
			Principal
		};
		const { Code } = await RequestHttp.post(api, params);
		if (Code === '00000') {
			messageApi.success(t('messageSuccess'));
			handleCancel();
		}
	};
	return (
		<Modal title={t('account.changePassword')} open={isModalOpen} onCancel={handleCancel} onOk={onFinish}>
			{contextHolder}
			<Form
				name="basic"
				form={form}
				labelCol={{ span: 5 }}
				wrapperCol={{ span: 19 }}
				autoComplete="off"
				initialValues={{ Principal: user.Principal }}
			>
				<Form.Item<ChangePasswordFormValues>
					label={t('login.principal')}
					name="Principal"
					rules={[{ required: true, message: t('account.inputPrincipal') }]}
				>
					<Input disabled />
				</Form.Item>
				<Form.Item<ChangePasswordFormValues>
					label={t('account.oldPassword')}
					name="OldCredential"
					rules={[{ required: true, message: t('account.inputOldPassword') }]}
				>
					<Input.Password />
				</Form.Item>

				<Form.Item<ChangePasswordFormValues>
					label={t('account.newPassword')}
					name="NewCredential"
					rules={[{ required: true, message: t('account.inputNewPassword') }]}
				>
					<Input.Password />
				</Form.Item>
				<Form.Item<ChangePasswordFormValues>
					label={t('account.confirmNewPassword')}
					name="ConfirmNewCredential"
					rules={[
						{ required: true, message: t('account.inputConfirmPassword') },
						({ getFieldValue }) => ({
							validator(_, value) {
								if (!value || getFieldValue('NewCredential') === value) {
									return Promise.resolve();
								}
								return Promise.reject(new Error(t('account.passwordMismatch')));
							}
						})
					]}
				>
					<Input.Password />
				</Form.Item>
			</Form>
		</Modal>
	);
};

export default ChangePasswordModal;
