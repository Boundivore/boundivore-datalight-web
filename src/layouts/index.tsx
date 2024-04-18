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
import { Layout, Avatar, Dropdown, App, Spin, Button, Breadcrumb } from 'antd';
import type { MenuProps } from 'antd';
import { UserOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import routes from '~react-pages';
import LayoutMenu from './components/menu';
import { useTranslation } from 'react-i18next';
import { useRoutes, useLocation } from 'react-router-dom';
// import Logo from '@/assets/logo.png';
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
	const [isVisible, setIsVisible] = useState(false);
	const location = useLocation();
	// const { navigateToLogin, navigateToHome } = useNavigater();
	const { navigateToLogin } = useNavigater();
	const { modal } = App.useApp();
	const apiLogout = APIConfig.logout;
	const items: MenuProps['items'] = [
		{
			label: t('header.myAccount'),
			key: '1'
		},
		{
			label: (
				<div
					onClick={() => {
						modal.confirm({
							title: t('login.confirmLogout'),
							okText: t('confirm'),
							cancelText: t('cancel'),
							onOk: async () => {
								const data = await RequestHttp.get(apiLogout);
								data.Code === '00000' && navigateToLogin();
							}
						});
					}}
				>
					{t('header.logout')}
				</div>
			),
			key: '2'
		}
	];
	const handleMouseEnter = () => {
		setIsVisible(true);
	};

	const handleMouseLeave = () => {
		setIsVisible(false);
	};
	const breadcrumbItems = () => {
		const parts = location.pathname.split('/');
		const path = parts[parts.length - 1];
		return [{ title: t(`tabs.${path}`) }];
	};
	return (
		<Layout className="w-full min-w-[1200px] h-[calc(100vh)]">
			<Header className="flex items-center">
				{/* <img className="cursor-pointer" src={Logo} height={40} onClick={navigateToHome} /> */}
				<div className="relative left-[50px]">
					<LayoutMenu />
				</div>
				<Dropdown menu={{ items }} className="absolute right-[50px]">
					<Avatar className="bg-[#51c2fe]" size="large" icon={<UserOutlined />} />
				</Dropdown>
			</Header>
			<Layout>
				{!hideSider ? (
					<div className="relative bg-[#fff]" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
						<Sider
							className={`${collapsed ? 'w-[80px]' : 'w-[250px]'} pt-[15px]`}
							theme="light"
							collapsible
							collapsed={collapsed}
							trigger={null}
						>
							<LayoutMenu />
							<Footer className={`fixed bottom-0 bg-white p-6 font-bold ${collapsed ? 'hidden' : 'w-[250px]'}`}>
								{t('poweredBy')}
							</Footer>
						</Sider>
						{isVisible && (
							<Button
								className={`absolute top-[40%] w-[18px] h-[35px] z-[999] border-l-0 rounded-bl-none rounded-tl-none ${
									collapsed ? 'left-[80px]' : 'left-[250px]'
								}`}
								icon={collapsed ? <RightOutlined className="text-[12px]" /> : <LeftOutlined className="text-[12px]" />}
								onClick={() => setCollapsed(!collapsed)}
								type="primary"
								ghost
							></Button>
						)}
					</div>
				) : null}
				<Content>
					<Breadcrumb className="ml-[44px] mt-[20px] font-bold text-[18px]" items={breadcrumbItems()} />
					<Suspense fallback={<Spin fullscreen />}>{useRoutes(routes)}</Suspense>
				</Content>
			</Layout>
			<Footer className={`h-[40px] leading-[40px] p-0 text-center bg-white font-bold ${collapsed ? 'hidden' : 'w-full'}`}>
				{t('poweredBy')}
			</Footer>
		</Layout>
	);
};

export default Layouts;
