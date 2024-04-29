/**
 * Copyright (C) <2023> <Boundivore> <boundivore@foxmail.com>
 * <p>
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the Apache License, Version 2.0
 * as published by the Apache Software Foundation.
 * <p>
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * Apache License, Version 2.0 for more details.
 * <p>
 * You should have received a copy of the Apache License, Version 2.0
 * along with this program; if not, you can obtain a copy at
 * http://www.apache.org/licenses/LICENSE-2.0.
 */
/**
 * RoleManage 角色管理
 * @author Tracy
 */

import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Button, Flex, Space, Badge, App, message } from 'antd';
import type { TableColumnsType } from 'antd';
import ContainerCard from '@/components/containerCard';
import { RoleVo } from '@/api/interface';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import useNavigater from '@/hooks/useNavigater';

const RoleManage: FC = () => {
	const { t } = useTranslation();
	const { navigateToAddRole, navigateToRoleDetail } = useNavigater();
	const { modal } = App.useApp();
	const [messageApi] = message.useMessage();
	const [tableData, setTableData] = useState<RoleVo[]>([]);

	// 顶部操作按钮配置
	const buttonConfigTop = [
		{
			id: 1,
			label: t('permission.addRole'),
			callback: () => navigateToAddRole(),
			disabled: false
		}
	];
	//单条操作按钮配置;
	const buttonConfigItem = (text: [], record: RoleVo) => {
		const { RoleId, Enabled } = record;
		return [
			{
				id: 1,
				label: t('detail'),
				callback: () => navigateToRoleDetail(RoleId),
				disabled: false
			},
			{
				id: 2,
				label: Enabled ? t('disable') : t('enable'),
				callback: () => switchRoleEnabled(Enabled, RoleId),
				disabled: false
			},
			{
				id: 3,
				label: t('permission.attachPermission'),
				// callback: () => {
				// 	setCurrentRole(record);
				// 	setIsAttchModalOpen(true);
				// },
				callback: () => navigateToAddRole(RoleId),
				disabled: false
			},
			{
				id: 4,
				label: t('permission.detachPermission'),
				callback: () => detachPermission(RoleId),
				disabled: false
			},
			{
				id: 5,
				label: t('permission.removeRole'),
				callback: () => removeRole(RoleId),
				disabled: false
			}
		];
	};
	const columns: TableColumnsType<RoleVo> = [
		{
			title: t('permission.roleName'),
			dataIndex: 'RoleName',
			key: 'RoleName',
			width: '15%'
		},
		{
			title: t('permission.roleDes'),
			dataIndex: 'RoleComment',
			key: 'RoleComment',
			width: '20%'
		},
		{
			title: t('permission.roleType'),
			dataIndex: 'RoleType',
			key: 'RoleType',
			width: '10%',
			render: text => t(`permission.${text}`)
		},
		{
			title: t('state'),
			dataIndex: 'Enabled',
			key: 'Enabled',
			width: '10%',
			render: text => (
				<Badge status={text ? 'success' : 'error'} text={text ? t(`permission.enabled`) : t(`permission.disabled`)} />
			)
		},
		{
			title: t('operation'),
			key: 'operation',
			dataIndex: 'operation',
			width: '35%',
			render: (text, record) => {
				return (
					<Space>
						{buttonConfigItem(text, record).map(button => (
							<Button key={button.id} type="primary" size="small" ghost disabled={button.disabled} onClick={button.callback}>
								{button.label}
							</Button>
						))}
					</Space>
				);
			}
		}
	];
	const detachPermission = (roleId: string | number) => {
		modal.confirm({
			title: t('permission.detachPermission'),
			content: t('permission.detachPermissionConfirm'),
			okText: t('confirm'),
			cancelText: t('cancel'),
			onOk: async () => {
				const api = APIConfig.detachPermissionRoleByRoleId;
				const params = {
					RoleIdList: [roleId]
				};
				const { Code } = await RequestHttp.post(api, params);
				if (Code === '00000') {
					messageApi.success(t('messageSuccess'));
					getRoleList(); //删除成功更新列表
				}
			}
		});
	};
	const removeRole = (roleId: string | number) => {
		modal.confirm({
			title: t('permission.removeRole'),
			content: t('permission.removeRoleConfirm'),
			okText: t('confirm'),
			cancelText: t('cancel'),
			onOk: async () => {
				const api = APIConfig.removeRole;
				const params = {
					RoleIdList: [roleId]
				};
				const { Code } = await RequestHttp.post(api, params);
				if (Code === '00000') {
					messageApi.success(t('messageSuccess'));
					getRoleList(); //删除成功更新列表
				}
			}
		});
	};
	const switchRoleEnabled = (enabled: boolean, roleId: string | number) => {
		modal.confirm({
			title: enabled ? t('disable') : t('enable'),
			content: t('operationServiceConfirm', { operation: enabled ? t('disable') : t('enable') }),
			okText: t('confirm'),
			cancelText: t('cancel'),
			onOk: async () => {
				const api = APIConfig.switchRoleEnabled;
				const params = {
					Enabled: !enabled,
					RoleId: roleId
				};
				const { Code } = await RequestHttp.post(api, params);
				if (Code === '00000') {
					messageApi.success(t('messageSuccess'));
					getRoleList(); //删除成功更新列表
				}
			}
		});
	};
	const getRoleList = async () => {
		const api = APIConfig.getRoleList;
		const {
			Data: { RoleList }
		} = await RequestHttp.get(api);
		setTableData(RoleList);
	};
	useEffect(() => {
		getRoleList();
	}, []);
	return (
		<ContainerCard>
			<Flex justify="space-between">
				<Space>
					{buttonConfigTop.map(button => (
						<Button key={button.id} type="primary" disabled={button.disabled} onClick={button.callback}>
							{button.label}
						</Button>
					))}
				</Space>
			</Flex>
			<Table
				className="mt-[20px]"
				rowKey="RoleId"
				// rowSelection={{
				// 	...rowSelection
				// }}
				columns={columns}
				dataSource={tableData}
			/>
		</ContainerCard>
	);
};
export default RoleManage;
