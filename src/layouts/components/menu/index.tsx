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
import { Menu } from 'antd';
import { AppstoreOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
	label: React.ReactNode,
	key: React.Key,
	icon?: React.ReactNode,
	children?: MenuItem[],
	type?: 'group'
): MenuItem {
	return {
		key,
		icon,
		children,
		label,
		type
	} as MenuItem;
}

const LayoutMenu: React.FC = () => {
	const location = useLocation();
	const { t } = useTranslation();
	const items: MenuProps['items'] = [
		getItem(<NavLink to="/home">{t('tabs.clusterManage')}</NavLink>, '/home', <AppstoreOutlined />),
		getItem(<NavLink to="/node/manageList">{t('tabs.nodeManage')}</NavLink>, '/node/manageList', <AppstoreOutlined />),
		getItem(<NavLink to="/home">{t('tabs.serviceManage')}</NavLink>, 'sub4', <AppstoreOutlined />),
		getItem(<NavLink to="/home">{t('tabs.config')}</NavLink>, 'sub5', <AppstoreOutlined />),

		{ type: 'divider' },

		getItem(t('tabs.myAccount'), '/auth', <SettingOutlined />, [
			getItem(<NavLink to="/auth/changePassword">{t('tabs.changePassword')}</NavLink>, '/changePassword"'),
			getItem('Option 10', '10'),
			getItem('Option 11', '11'),
			getItem('Option 12', '12')
		])
	];
	return (
		<div className="menu">
			<Menu mode="inline" theme="light" triggerSubMenuAction="click" selectedKeys={[location.pathname]} items={items}></Menu>
		</div>
	);
};

export default LayoutMenu;
