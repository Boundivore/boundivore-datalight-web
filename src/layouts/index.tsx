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
 * Layouts -页面框架
 * @author Tracy.Guo
 */
import { useState, Suspense } from 'react';
import { Layout, Avatar, Popover, Menu, Breadcrumb, App, Spin } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import routes from '~react-pages';
import LayoutMenu from './components/menu';
import { useTranslation } from 'react-i18next';
import { useRoutes } from 'react-router-dom';
import Logo from '@/assets/logo.png';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import useNavigater from '@/hooks/useNavigater';

const { Header, Footer, Sider, Content } = Layout;

// 定义一个接口，描述组件的 props
interface MyComponentProps {
	hideSider?: boolean;
}

const Layouts: React.FC<MyComponentProps> = ({ hideSider }) => {
	const { t } = useTranslation();
	const [collapsed, setCollapsed] = useState(false);
	const { navigateToLogin } = useNavigater();
	const { modal } = App.useApp();
	const apiLogout = APIConfig.logout;
	const content = (
		<Menu
			items={[
				{
					label: t('header.myAccount'),
					key: '1'
				},
				{
					label: t('header.logout'),
					key: '2'
				}
			]}
			onClick={({ key }) => {
				if (key === '2') {
					modal.confirm({
						title: t('login.confirmLogout'),
						okText: t('confirm'),
						cancelText: t('cancel'),
						onOk: async () => {
							const data = await RequestHttp.get(apiLogout);
							data.Code === '00000' && navigateToLogin();
						}
					});
				}
			}}
		></Menu>
	);
	return (
		<Layout className="w-full min-w-[1200px] h-[calc(100vh)]">
			<Header className="flex items-center justify-between">
				<img src={Logo} height={60} />
				<Popover content={content}>
					<Avatar
						className="bg-[#87d068]"
						src="https://xsgames.co/randomusers/avatar.php?g=pixel&key=1"
						size="large"
						icon={<UserOutlined />}
					/>
				</Popover>
			</Header>
			<Layout>
				{!hideSider ? (
					<Sider theme="light" collapsible collapsed={collapsed} onCollapse={value => setCollapsed(value)}>
						{/* <Header>Logo</Header> */}
						<LayoutMenu />
					</Sider>
				) : null}
				<Content>
					<Breadcrumb />
					<Suspense fallback={<Spin fullscreen />}>{useRoutes(routes)}</Suspense>
					<Footer className="fixed bottom-0 w-full bg-white p-4 shadow-md font-bold">{t('poweredBy')}</Footer>
				</Content>
			</Layout>
		</Layout>
	);
};

export default Layouts;
