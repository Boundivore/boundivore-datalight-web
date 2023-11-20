import Layouts from '@/layouts';
import { List } from 'antd';
import { RouteObject } from '@/routers/interface';

const HomePage: React.FC = () => {
	return <List />;
};
// 首页
const Home: Array<RouteObject> = [
	{
		element: <Layouts />,
		children: [
			{
				path: '/home',
				element: <HomePage />,
				meta: {
					requiresAuth: true,
					title: '首页',
					key: 'home'
				}
			}
		]
	}
];

export default Home;
