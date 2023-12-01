/**
 *
 *
 */
// import { useEffect } from 'react';
// import { Outlet } from 'react-router-dom';
import { ReactNode } from 'react';
import { Layout, Avatar, Popover, Menu, Breadcrumb } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import LayoutMenu from './components/menu';
import { useTranslation } from 'react-i18next';
import './index.css';

const { Header, Footer, Sider, Content } = Layout;

// 定义一个接口，描述组件的 props
interface MyComponentProps {
	children: ReactNode; // ReactNode 是一个表示任何可以在 React 中渲染的节点的类型
	hideSider?: boolean;
}

const Layouts: React.FC<MyComponentProps> = ({ children, hideSider }) => {
	const { t } = useTranslation();
	const content = (
		<Menu
			items={[
				{
					label: '我的帐户',
					key: '1'
				},
				{
					label: t('header.logout'),
					key: '2'
				}
			]}
		></Menu>
	);
	return (
		<Layout className="container">
			<Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
				<div className="logo">logo</div>
				<Popover content={content}>
					<Avatar
						src="https://xsgames.co/randomusers/avatar.php?g=pixel&key=1"
						size="large"
						style={{ backgroundColor: '#87d068' }}
						icon={<UserOutlined />}
					/>
				</Popover>
			</Header>
			<Layout>
				{!hideSider ? (
					<Sider theme="light">
						{/* <Header>Logo</Header> */}
						<LayoutMenu />
					</Sider>
				) : null}
				<Content>
					<Breadcrumb />
					{children}
					<Footer>Footer</Footer>
				</Content>
			</Layout>
		</Layout>
	);
};

export default Layouts;
