/**
 *
 *
 */
// import { Outlet } from 'react-router-dom';
import { ReactNode, useState } from 'react';
import { Layout, Avatar, Popover, Menu, Breadcrumb, App } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import LayoutMenu from './components/menu';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Logo from '@/assets/logo.png';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';

const { Header, Footer, Sider, Content } = Layout;

// 定义一个接口，描述组件的 props
interface MyComponentProps {
	children: ReactNode;
	hideSider?: boolean;
}

const Layouts: React.FC<MyComponentProps> = ({ children, hideSider }) => {
	const { t } = useTranslation();
	const [collapsed, setCollapsed] = useState(false);
	const navigate = useNavigate();
	const { modal } = App.useApp();
	const apiLogout = APIConfig.logout;
	const content = (
		<Menu
			items={[
				{
					label: t('header.myAccount'),
					key: '1'
				},
				{
					label: t('header.logout'),
					key: '2'
				}
			]}
			onClick={({ key }) => {
				if (key === '2') {
					modal.confirm({
						title: t('login.confirmLogout'),
						okText: t('confirm'),
						cancelText: t('cancel'),
						onOk: async () => {
							const data = await RequestHttp.get(apiLogout);
							data.Code === '00000' && navigate('/auth/login');
						}
					});
				}
			}}
		></Menu>
	);
	return (
		<Layout className="w-full min-w-[1200px] min-h-[calc(100vh)]">
			<Header className="flex items-center justify-between">
				<img src={Logo} height={60} />
				<Popover content={content}>
					<Avatar
						className="bg-[#87d068]"
						src="https://xsgames.co/randomusers/avatar.php?g=pixel&key=1"
						size="large"
						icon={<UserOutlined />}
					/>
				</Popover>
			</Header>
			<Layout>
				{!hideSider ? (
					<Sider theme="light" collapsible collapsed={collapsed} onCollapse={value => setCollapsed(value)}>
						{/* <Header>Logo</Header> */}
						<LayoutMenu />
					</Sider>
				) : null}
				<Content>
					<Breadcrumb />
					{/* <Card style={{ width: '96%', height: 'calc(100% - 40px)', margin: '20px auto' }}>{children}</Card> */}
					{children}
					<Footer>{t('poweredBy')}</Footer>
				</Content>
			</Layout>
		</Layout>
	);
};

export default Layouts;
