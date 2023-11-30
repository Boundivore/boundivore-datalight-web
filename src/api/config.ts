interface Actions {
	[key: string]: string;
}

const APIConfig: Actions = {
	createCluster: '/api/v1/master/cluster/new',
	parseHostname: '/api/v1/master/node/init/hostname/parse',
	nodeInitNode: '/api/v1/master/node/init/parse/list' //轮询接口

	// clusterList: ''
};
for (let key in APIConfig) {
	APIConfig[key] = '/mock/2601924' + APIConfig[key];
}

export default APIConfig;
