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
interface Actions {
	[key: string]: string;
}

const APIConfig: Actions = {
	// auth
	login: '/v1/master/user/login',
	isLogin: '/v1/master/user/isLogin',
	logout: '/v1/master/user/logout',
	changePassword: '/v1/master/user/changePassword',
	// 集群相关
	getClusterList: '/v1/master/cluster/getClusterList',
	createCluster: '/v1/master/cluster/new',
	getDLCVersion: '/v1/master/dlc/service/list',
	parseHostname: '/v1/master/node/init/hostname/parse',
	nodeInitList: '/v1/master/node/init/parse/list', //轮询接口
	detect: '/v1/master/node/init/detect',
	detectList: '/v1/master/node/init/detect/list', //轮询接口
	check: '/v1/master/node/init/check',
	checkList: '/v1/master/node/init/check/list', //轮询接口
	dispatch: '/v1/master/node/init/dispatch',
	dispatchList: '/v1/master/node/init/dispatch/list', //轮询接口
	dispatchProgress: '/v1/master/node/job/dispatch/progress', //轮询接口
	startWorker: '/v1/master/node/init/startWorker',
	startWorkerList: '/v1/master/node/init/startWorker/list', //轮询接口
	add: '/v1/master/node/init/add',
	getProcedure: '/v1/master/init/procedure/get',
	setProcedure: '/v1/master/init/procedure/persist',
	removeProcedure: '/v1/master/init/procedure/remove',
	removeCluster: '/v1/master/cluster/remove',
	updateCurrentView: '/v1/master/cluster/updateCurrentView',
	//节点相关
	nodeList: '/v1/master/node/list',
	nodeListWithComponent: '/v1/master/node/listWithComponent',
	removeNode: '/v1/master/node/removeBatchByIds', // 支持批量删除
	operateNode: '/v1/master/node/operate',
	getNodeLog: '/v1/master/job/getNodeJobLogList',
	nodeJobProgress: '/v1/master/node/job/progress',
	getActiveNodeJobId: '/v1/master/job/getActiveNodeJobId',
	// 服务相关
	serviceList: '/v1/master/service/list',
	selectService: '/v1/master/service/select',
	operateService: '/v1/master/operate/jobDetail',
	operateJob: '/v1/master/operate/job',
	// 组件相关
	componentList: '/v1/master/component/list',
	componentListByServiceName: '/v1/master/component/listByServiceName',
	selectComponent: '/v1/master/component/select',
	preconfigList: '/v1/master/config/pre/list',
	preconfigSave: '/v1/master/config/pre/save',
	removeComponent: '/v1/master/component/removeBatchByIds',
	webUI: '/v1/master/component/webUI/list',
	// 部署相关
	deploy: '/v1/master/deploy',
	jobProgress: '/v1/master/job/progress',
	nodeJobPlan: '/v1/master/job/activeNodeJobPlanProgress', // 查询节点异步任务计划生成的进度
	jobPlan: '/v1/master/job/activeJobPlanProgress', // 查询服务组件部署时异步任务计划生成的进度
	getActiveJobId: '/v1/master/job/getActiveJobId',
	getLog: '/v1/master/job/getJobLogList',
	// 配置相关
	listSummary: '/v1/master/config/listSummary',
	listByGroup: '/v1/master/config/listByGroup',
	saveByGroup: '/v1/master/config/saveByGroup',
	//前端状态缓存相关
	webStateGet: '/v1/master/web/state/get',
	webStateSave: '/v1/master/web/state/save',
	webStateClear: '/v1/master/web/state/clearByClusterId',
	// 监控相关
	prometheus: '/v1/master/prometheus/invoke',
	getPrometheusStatus: '/v1/master/component/listByComponentName',
	// 日志相关
	getLogRootDirectory: '/v1/master/log/file/getLogRootDirectory',
	getLogCollection: '/v1/master/log/file/getLogCollectionWithNodeId',
	loadFileConten: '/v1/master/log/file/loadFileContentWithNodeId',
	//权限相关
	getUserDetailList: '/v1/master/user/getUserDetailList',
	getRoleList: '/v1/master/role/getRoleList',
	register: '/v1/master/user/register'
};
for (let key in APIConfig) {
	// APIConfig[key] = '/mock/2601924' + APIConfig[key];
	APIConfig[key] = '/api' + APIConfig[key];
}

export default APIConfig;
