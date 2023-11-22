import { Navigate, createBrowserRouter } from 'react-router-dom';
import { RouteObject } from '@/routers/interface';
import Home from '@/pages/home';
import Cluster from '@/pages/cluster';
import CreateCluster from '@/pages/cluster/create';

const routerList: RouteObject[] = [
	{
		path: '/',
		element: <Navigate to="/login" />
	},
	{
		path: 'home',
		element: <Home />
	},
	{
		path: 'cluster',
		element: <Cluster />
	},
	{
		path: 'cluster/create',
		element: <CreateCluster />
	}
];
const Router = createBrowserRouter(routerList);

export default Router;
