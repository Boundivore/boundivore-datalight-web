interface Actions {
	[key: string]: string;
}

const APIConfig: Actions = {
	createCluster: '/api/v1/master/cluster/new'
};
for (let key in APIConfig) {
	APIConfig[key] = '/mock/2601924' + APIConfig[key];
}

export default APIConfig;
