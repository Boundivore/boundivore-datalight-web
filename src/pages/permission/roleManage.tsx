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
import AttchPermissionModal from '@/components/permission/attchPermissionModal';

const RoleManage: FC = () => {
	const { t } = useTranslation();
	const { navigateToAddRole } = useNavigater();
	const { modal } = App.useApp();
	const [messageApi] = message.useMessage();
	const [isAttchModalOpen, setIsAttchModalOpen] = useState(false);
	const [currentRole, setCurrentRole] = useState<RoleVo>({} as RoleVo);

	// 顶部操作按钮配置
	const [tableData, setTableData] = useState<RoleVo[]>([]);
	const buttonConfigTop = [
		{
			id: 1,
			label: t('permission.addRole'),
			callback: navigateToAddRole,
			disabled: false
		}
	];
	//单条操作按钮配置;
	const buttonConfigItem = (text: [], record: RoleVo) => {
		const { RoleId, Enabled } = record;
		return [
			{
				id: 1,
				label: Enabled ? t('disable') : t('enable'),
				callback: () => switchRoleEnabled(Enabled, RoleId),
				disabled: false
			},
			{
				id: 2,
				label: t('permission.assignPermission'),
				callback: () => {
					setCurrentRole(record);
					setIsAttchModalOpen(true);
				},
				disabled: false
			},
			{
				id: 3,
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
			key: 'RoleName'
		},
		{
			title: t('permission.roleDes'),
			dataIndex: 'RoleComment',
			key: 'RoleComment'
		},
		{
			title: t('permission.roleType'),
			dataIndex: 'RoleType',
			key: 'RoleType',
			render: text => t(`permission.${text}`)
		},
		{
			title: t('state'),
			dataIndex: 'Enabled',
			key: 'Enabled',
			render: text => (
				<Badge status={text ? 'success' : 'error'} text={text ? t(`permission.enabled`) : t(`permission.disabled`)} />
			)
		},
		{
			title: t('operation'),
			key: 'operation',
			dataIndex: 'operation',
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
			{isAttchModalOpen ? (
				<AttchPermissionModal
					isModalOpen={isAttchModalOpen}
					role={currentRole}
					handleCancel={() => setIsAttchModalOpen(false)}
					handleOk={getRoleList}
				/>
			) : null}
		</ContainerCard>
	);
};
export default RoleManage;
