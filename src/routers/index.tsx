import { Navigate, createBrowserRouter } from 'react-router-dom';
import { RouteObject } from '@/routers/interface';
import Home from '@/pages/home';

const routerList: RouteObject[] = [
	{
		path: '/',
		element: <Navigate to="/login" />
	},
	{
		path: 'home',
		element: <Home />
	}
];
const Router = createBrowserRouter(routerList);

export default Router;
