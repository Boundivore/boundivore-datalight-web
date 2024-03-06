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
 * 登录页
 * @author Tracy.Guo
 */
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, Input, Col, Row, Space, App } from 'antd';
import { md5 } from 'js-md5';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import useStore, { usePersistStore } from '@/store/store';
import Logo from '@/assets/logo.png';
import useNavigater from '@/hooks/useNavigater';
import { UserInfoType } from '@/api/interface';

type FieldType = {
	Principal?: string;
	Credential?: string;
};

const LoginPage: React.FC = () => {
	const [form] = Form.useForm();
	const { t } = useTranslation();
	const { navigateToHome } = useNavigater();
	const { setIsNeedChangePassword } = useStore();
	const { userInfo, setUserInfo } = usePersistStore();
	const { modal } = App.useApp();
	const onFinish = async (values: any) => {
		const { Credential, Principal } = values;
		const hexHash = md5(Credential);
		const apiLogin = APIConfig.login;
		const params = {
			Credential: hexHash,
			// TODO 确认一下这里是否保持固定
			IdentityType: 'USERNAME',
			Principal
		};
		const authData = await RequestHttp.post(apiLogin, params);
		const {
			Code,
			Data: { UserId, Nickname, Realname, IsNeedChangePassword }
		} = authData;
		if (Code === '00000') {
			setUserInfo({ userId: UserId, nickName: Nickname, realName: Realname });
			setIsNeedChangePassword(IsNeedChangePassword);
			navigateToHome();
		}
	};

	const onFinishFailed = (errorInfo: any) => {
		console.log('Failed:', errorInfo);
	};
	const isLogin = async () => {
		const apiIsLogin = APIConfig.isLogin;
		const loginData = await RequestHttp.get(apiIsLogin);
		loginData.Data && navigateToHome();
	};
	const forgotPassword = () => {
		modal.info({ title: '忘记密码', content: '请联系管理员' });
	};
	useEffect(() => {
		(userInfo as UserInfoType).userId && isLogin();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<div className="min-w-[1200px] bg-[#e9effb] bg-cover bg-center h-screen flex">
			<Row className="w-7/12 height-[500] m-auto p-auto border border-blue-500 shadow-blue-300 shadow-2xl">
				{/* <Row className="w-7/12 height-[500] m-auto p-auto border border-blue-500 shadow-2xl shadow-blue-100"> */}
				<Col span={12} className="bg-[#51c2fe] bg-cover bg-center"></Col>
				<Col span={12} className="pt-20 pb-10 px-10 flex items-center justify-center flex-col bg-[#e9effb]">
					<Space direction="vertical" align="center" size="small">
						<img src={Logo} height={60} className="m-auto p-auto" />
						<Form
							className="w-[300px]"
							form={form}
							name="basic"
							layout="vertical"
							onFinish={onFinish}
							onFinishFailed={onFinishFailed}
							autoComplete="off"
							requiredMark={false}
						>
							<Form.Item<FieldType>
								className="text-[#2e436b]"
								label={t('login.principal')}
								name="Principal"
								rules={[{ required: true, message: t('account.inputPrincipal') }]}
							>
								<Input />
							</Form.Item>
							<Form.Item<FieldType>
								className="text-[#2e436b] mb-[5px]"
								label={t('login.credential')}
								name="Credential"
								rules={[{ required: true, message: t('login.inputPassword') }]}
							>
								<Input.Password />
							</Form.Item>
							<Form.Item>
								<a className="float-right text-[#51c2fe]" onClick={forgotPassword}>
									{t('login.forgotPassword')}
								</a>
							</Form.Item>
							<Form.Item className="flex justify-center">
								<Button htmlType="submit" className="w-[200px]">
									{t('login.confirm')}
								</Button>
							</Form.Item>
						</Form>
						<span className="font-bold text-[#2e436b]">{t('poweredBy')}</span>
					</Space>
				</Col>
			</Row>
		</div>
	);
};

export default LoginPage;
