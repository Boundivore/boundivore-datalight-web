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
 * @author Tracy
 */
import { useState, Suspense } from 'react';
import { Layout, Avatar, Dropdown, App, Spin, Button, Breadcrumb } from 'antd';
import type { MenuProps } from 'antd';
import { UserOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import routes from '~react-pages';
import LayoutMenu from './components/menu';
import i18n, { t } from 'i18next';
import { useRoutes, useLocation, useSearchParams } from 'react-router-dom';
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
	const [collapsed, setCollapsed] = useState(false);
	const [isVisible, setIsVisible] = useState(false);
	const location = useLocation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	// const { navigateToLogin, navigateToChangePassword } = useNavigater();
	const { navigateToLogin, navigateToHome, navigateToChangePassword } = useNavigater();
	const { modal } = App.useApp();
	const apiLogout = APIConfig.logout;
	const items: MenuProps['items'] = [
		{
			label: t('header.myAccount'),
			key: '1'
		},
		{
			label: <a onClick={() => navigateToChangePassword()}>{t('tabs.changePassword')}</a>,
			key: '2'
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
			key: '3'
		}
	];
	const handleMouseEnter = () => {
		setIsVisible(true);
	};

	const handleMouseLeave = () => {
		setIsVisible(false);
	};
	const breadcrumbItems = () => {
		// 将路径按 '/' 分割并过滤掉空项
		const parts = location.pathname.split('/').filter(part => part);
		let path = parts[parts.length - 1];
		// 面包屑中有个特殊情况，新增角色页面同时用于分配权限，检测url中param中存在id且 path为addRole 则为分配权限页面
		if (id && path === 'addRole') {
			path = 'attachPermission';
		}
		if (i18n.exists(`tabs.${path}`)) {
			// 如果存在，则调用 t() 方法翻译字段
			return [{ title: t(`tabs.${path}`) }];
		} else {
			// 如果不存在，返回空数组
			return [];
		}

		// 生成面包屑数组
		// const breadcrumbs = parts
		// 	.map(part => {
		// 		// 特殊情况处理
		// 		if (id && part === 'addRole') {
		// 			part = 'attachPermission';
		// 		}
		// 		// 检查翻译是否存在
		// 		if (i18n.exists(`tabs.${part}`)) {
		// 			return { title: t(`tabs.${part}`) };
		// 		}
		// 		return null;
		// 	})
		// 	.filter(item => item); // 过滤掉 null 项

		// return breadcrumbs;
	};
	return (
		<Layout className="w-full min-w-[1360px] h-[calc(100vh)]">
			<Header className="flex items-center">
				<img className="cursor-pointer" src={Logo} height={40} onClick={navigateToHome} />
				<div className="relative left-[30px]">
					<LayoutMenu />
				</div>
				<Dropdown menu={{ items }} className="absolute right-[50px]">
					<Avatar className="bg-[#51c2fe]" size="large" icon={<UserOutlined />} />
				</Dropdown>
			</Header>
			<Layout className="overflow-y-auto">
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
					<Suspense
						fallback={
							<div className="h-[90%]">
								<Spin fullscreen />
							</div>
						}
					>
						{useRoutes(routes)}
					</Suspense>
					<Footer className={`h-[40px] leading-[40px] p-0 text-center bg-white font-bold ${collapsed ? 'hidden' : 'w-full'}`}>
						{t('poweredBy')}
					</Footer>
				</Content>
			</Layout>
		</Layout>
	);
};

export default Layouts;
