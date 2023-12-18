import { Menu } from 'antd';
import { AppstoreOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { NavLink } from 'react-router-dom';

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
	label: React.ReactNode,
	key: React.Key,
	icon?: React.ReactNode,
	children?: MenuItem[],
	type?: 'group'
): MenuItem {
	return {
		key,
		icon,
		children,
		label,
		type
	} as MenuItem;
}

const items: MenuProps['items'] = [
	getItem(<NavLink to="/home">集群管理</NavLink>, 'sub2', <AppstoreOutlined />),

	{ type: 'divider' },

	getItem('Navigation Three', 'sub4', <SettingOutlined />, [
		getItem('Option 9', '9'),
		getItem('Option 10', '10'),
		getItem('Option 11', '11'),
		getItem('Option 12', '12')
	])
];

const LayoutMenu: React.FC = () => {
	return (
		<div className="menu">
			{/* <Spin spinning={loading} tip="Loading..."> */}
			{/* <Logo></Logo> */}
			<Menu
				mode="inline"
				theme="light"
				triggerSubMenuAction="click"
				// openKeys={openKeys}
				// selectedKeys={selectedKeys}
				items={items}
				// onClick={clickMenu}
				// onOpenChange={onOpenChange}
			></Menu>
			{/* </Spin> */}
		</div>
	);
};

export default LayoutMenu;
