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
import { useState } from 'react';
import { Menu, App } from 'antd';
import {
	AppstoreOutlined,
	ApartmentOutlined,
	ClusterOutlined,
	FundViewOutlined,
	DashboardOutlined,
	SecurityScanOutlined,
	ReconciliationOutlined,
	AuditOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ViewActiveJobModal from '@/components/viewActiveJobModal';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import useStore from '@/store/store';

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
	const [isActiveJobModalOpen, setIsActiveJobModalOpen] = useState(false);
	const [modalType, setModalType] = useState('nodeJobProgress');
	const { setJobNodeId, setJobId } = useStore();
	const { modal } = App.useApp();

	const viewActiveNodeJob = async () => {
		const apiList = APIConfig.getActiveNodeJobId;
		const data = await RequestHttp.get(apiList);
		const {
			Data: { NodeJobId }
		} = data;
		setModalType('nodeJobProgress');
		setJobNodeId(NodeJobId);
		NodeJobId !== null
			? setIsActiveJobModalOpen(true)
			: modal.info({
					title: '当前没有活跃的任务'
			  });
	};
	const viewActiveJob = async () => {
		const apiList = APIConfig.getActiveJobId;
		const data = await RequestHttp.get(apiList);
		const {
			Data: { JobId }
		} = data;
		setModalType('jobProgress');
		setJobId(JobId);
		JobId !== null
			? setIsActiveJobModalOpen(true)
			: modal.info({
					title: '当前没有活跃的任务'
			  });
	};
	const items: MenuProps['items'] = [
		getItem(<NavLink to="/home">{t('tabs.home')}</NavLink>, '/home', <DashboardOutlined />),
		getItem(<NavLink to="/cluster">{t('tabs.cluster')}</NavLink>, '/cluster', <ClusterOutlined />),
		getItem(<NavLink to="/node">{t('tabs.node')}</NavLink>, '/node', <ApartmentOutlined />),
		getItem(<NavLink to="/service">{t('tabs.service')}</NavLink>, '/service', <AppstoreOutlined />),
		getItem(t('tabs.taskView'), '/task', <FundViewOutlined />, [
			getItem(<a onClick={viewActiveNodeJob}>{t('tabs.nodeTask')}</a>, '/nodeTask"'),
			getItem(<a onClick={viewActiveJob}>{t('tabs.serviceTask')}</a>, '/serviceTask"')
		]),
		getItem(t('tabs.monitorAlert'), '/monitorAlert', <SecurityScanOutlined />, [
			getItem(<NavLink to="/monitorAlert/monitor">{t('tabs.monitor')}</NavLink>, '/monitorAlert/monitor'),
			getItem(<NavLink to="/monitorAlert/alert?tab=alert">{t('tabs.alert')}</NavLink>, '/monitorAlert/alert')
		]),
		getItem(<NavLink to="/log">{t('tabs.log')}</NavLink>, '/log', <ReconciliationOutlined />),
		getItem(<span className="min-w-[90px] inline-block">{t('tabs.permission')}</span>, '/permission', <AuditOutlined />, [
			getItem(<NavLink to="/permission/userManage">{t('tabs.userManage')}</NavLink>, '/permission/userManage'),
			getItem(<NavLink to="/permission/roleManage">{t('tabs.roleManage')}</NavLink>, '/permission/roleManage')
		])
		// getItem(t('tabs.myAccount'), '/auth', <SettingOutlined />, [
		// 	getItem(<NavLink to="/auth/changePassword">{t('tabs.changePassword')}</NavLink>, '/changePassword"')
		// ])
	];
	const handleModalCancel = () => {
		setIsActiveJobModalOpen(false);
	};

	return (
		<>
			<div className="menu">
				<Menu
					className="relative z-10 bg-transparent"
					mode="horizontal"
					theme="light"
					triggerSubMenuAction="click"
					selectedKeys={[location.pathname]}
					items={items}
				></Menu>
			</div>
			{isActiveJobModalOpen ? (
				<ViewActiveJobModal isModalOpen={isActiveJobModalOpen} handleCancel={handleModalCancel} type={modalType} />
			) : null}
		</>
	);
};

export default LayoutMenu;
