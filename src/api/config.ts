interface Actions {
	[key: string]: string;
}

const APIConfig: Actions = {
	createCluster: '/api/v1/master/cluster/new',
	parseHostname: '/api/v1/master/node/init/hostname/parse',
	nodeInitList: '/api/v1/master/node/init/parse/list', //轮询接口
	detect: '/api/v1/master/node/init/detect',
	detectList: '/api/v1/master/node/init/detect/list' //轮询接口
};
for (let key in APIConfig) {
	APIConfig[key] = '/mock/2601924' + APIConfig[key];
}

export default APIConfig;
