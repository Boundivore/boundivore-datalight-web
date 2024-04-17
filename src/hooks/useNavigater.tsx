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
 * useNavigater - 自定义Hook
 * 将系统中用到的跳转收敛到这里, 路由地址如有变化，请查看是否需要更新该文件
 * @author Tracy.Guo
 */
import { useNavigate } from 'react-router-dom';

const useNavigater = () => {
	const navigate = useNavigate();

	const navigateToLogin = () => {
		navigate('/login');
	};
	const navigateToHome = () => {
		// 当前home是集群列表页，后续可能会是dashbord
		navigate('/home');
	};
	const navigateToClusterList = () => {
		// 当前home就是集群列表页，后续可能会是dashbord
		navigate('/cluster');
	};
	const navigateToNodeList = () => {
		navigate('/node');
	};
	const navigateToChangePassword = () => {
		navigate('/auth/changePassword');
	};
	// 跳转至节点初始化页面
	const navigateToNodeInit = (id: string | number) => {
		navigate(`/node/init?id=${id}`);
	};
	// 跳转至新建集群页面
	const navigateToCreateCluster = () => {
		navigate('/cluster/create');
	};
	// 跳转至新增集群页面
	const navigateToAddNode = (id: string | number) => {
		navigate(`/node/addNode?id=${id}`);
	};
	// 跳转至服务管理页面
	const navigateToService = () => {
		navigate(`/service`);
	};
	// 跳转至修改配置文件页面
	const navigateToConfig = (id: string | number, name: string) => {
		navigate(`/service/modifyConfig?id=${id}&name=${name}`);
	};
	// 跳转至组件管理页面
	const navigateToComManage = (id: string | number, name: string) => {
		navigate(`/service/componentManage?id=${id}&name=${name}`);
	};
	const navigateToAddComponent = (id: string | number, service?: string) => {
		navigate(`/service/addComponent?id=${id}${service ? `&service=${service}` : ''}`);
	};
	const navigateToViewLog = (nodeId: string | number, hostName: string) => {
		navigate(`/log/viewLog?node=${nodeId}&name=${hostName}`);
	};

	return {
		navigateToLogin,
		navigateToHome,
		navigateToClusterList,
		navigateToNodeList,
		navigateToChangePassword,
		navigateToNodeInit,
		navigateToCreateCluster,
		navigateToAddNode,
		navigateToService,
		navigateToConfig,
		navigateToComManage,
		navigateToAddComponent,
		navigateToViewLog
	};
};

export default useNavigater;
