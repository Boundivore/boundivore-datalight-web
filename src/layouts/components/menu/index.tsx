import { Menu } from 'antd';
import { AppstoreOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

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
	// getItem('集群管理', 'sub1', <MailOutlined />, [
	// 	getItem('Item 1', 'g1', null, [getItem('Option 1', '1'), getItem('Option 2', '2')], 'group'),
	// 	getItem('Item 2', 'g2', null, [getItem('Option 3', '3'), getItem('Option 4', '4')], 'group')
	// ]),

	getItem('集群管理', 'sub2', <AppstoreOutlined />, [
		getItem('Option 5', '5'),
		getItem('Option 6', '6'),
		getItem('Submenu', 'sub3', null, [getItem('Option 7', '7'), getItem('Option 8', '8')])
	]),

	{ type: 'divider' },

	getItem('Navigation Three', 'sub4', <SettingOutlined />, [
		getItem('Option 9', '9'),
		getItem('Option 10', '10'),
		getItem('Option 11', '11'),
		getItem('Option 12', '12')
	]),

	getItem('Group', 'grp', null, [getItem('Option 13', '13'), getItem('Option 14', '14')], 'group')
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
