/**
 *
 *
 */
// import { useEffect } from 'react';
// import { Outlet } from 'react-router-dom';
import { ReactNode } from 'react';
import { Layout } from 'antd';
import LayoutMenu from './components/menu';
import './index.css';

const { Header, Footer, Sider, Content } = Layout;

// 定义一个接口，描述组件的 props
interface MyComponentProps {
	children: ReactNode; // ReactNode 是一个表示任何可以在 React 中渲染的节点的类型
	hideSider?: boolean;
}
const Layouts: React.FC<MyComponentProps> = ({ children, hideSider }) => {
	return (
		<Layout className="container">
			<Header>Header</Header>
			<Layout>
				{!hideSider ? (
					<Sider theme="light">
						{/* <Header>Logo</Header> */}
						<LayoutMenu />
					</Sider>
				) : null}
				<Content>
					{children}
					<Footer>Footer</Footer>
				</Content>
			</Layout>
		</Layout>
	);
};

export default Layouts;
