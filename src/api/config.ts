interface Actions {
	[key: string]: string;
}

const APIConfig: Actions = {
	createCluster: '/v1/master/cluster/new',
	getDLCVersion: '/v1/master/dlc/service/list',
	parseHostname: '/v1/master/node/init/hostname/parse',
	nodeInitList: '/v1/master/node/init/parse/list', //轮询接口
	detect: '/v1/master/node/init/detect',
	detectList: '/v1/master/node/init/detect/list', //轮询接口
	check: '/v1/master/node/init/check',
	checkList: '/v1/master/node/init/check/list', //轮询接口
	dispatch: '/v1/master/node/init/dispatch',
	dispatchList: '/v1/master/node/init/dispatch/list',
	dispatchProgress: '/v1/master/node/job/dispatch/progress', //轮询接口
	add: '/v1/master/node/init/add'
};
for (let key in APIConfig) {
	// APIConfig[key] = '/mock/2601924' + APIConfig[key];
	APIConfig[key] = '/api' + APIConfig[key];
}

export default APIConfig;
