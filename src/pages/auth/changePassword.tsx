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
 * @author Tracy.Guo
 */
import { Form, Input, Button, Card, App } from 'antd';
import { md5 } from 'js-md5';
import { useTranslation } from 'react-i18next';
import useNavigater from '@/hooks/useNavigater';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import { usePersistStore } from '@/store/store';

interface ChangePasswordFormValues {
	Principal: string;
	OldCredential: string;
	NewCredential: string;
	ConfirmNewCredential: string;
}

const ChangePassword: React.FC = () => {
	const { t } = useTranslation();
	const { modal } = App.useApp();
	const { navigateToLogin } = useNavigater();
	const {
		userInfo: { realName }
	} = usePersistStore();

	const onFinish = async (values: ChangePasswordFormValues) => {
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
		const data = await RequestHttp.post(api, params);
		if (data.Code === '00000') {
			modal.confirm({
				title: t('prompt'),
				content: t('account.changeOK'),
				okText: t('confirm'),
				cancelText: t('cancel'),
				onOk: () => {
					navigateToLogin();
				}
			});
		}
	};
	return (
		<Card className="min-h-[calc(100%-50px)] m-[20px]" title={t('tabs.changePassword')}>
			<Form
				className="w-[600px]"
				name="basic"
				labelCol={{ span: 8 }}
				wrapperCol={{ span: 16 }}
				onFinish={onFinish}
				autoComplete="off"
				initialValues={{ Principal: realName }}
			>
				<Form.Item
					label={t('login.principal')}
					name="Principal"
					rules={[{ required: true, message: t('account.inputPrincipal') }]}
				>
					<Input disabled />
				</Form.Item>
				<Form.Item
					label={t('account.oldPassword')}
					name="OldCredential"
					rules={[{ required: true, message: t('account.inputOldPassword') }]}
				>
					<Input.Password />
				</Form.Item>

				<Form.Item
					label={t('account.newPassword')}
					name="NewCredential"
					rules={[{ required: true, message: t('account.inputNewPassword') }]}
				>
					<Input.Password />
				</Form.Item>
				<Form.Item
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
				<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
					<Button type="primary" htmlType="submit">
						{t('tabs.changePassword')}
					</Button>
				</Form.Item>
			</Form>
		</Card>
	);
};

export default ChangePassword;
