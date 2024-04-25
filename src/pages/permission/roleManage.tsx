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
import { Table, Button, Flex, Space } from 'antd';
import type { TableColumnsType } from 'antd';
import ContainerCard from '@/components/containerCard';
import { UserInfoVo } from '@/api/interface';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import useNavigater from '@/hooks/useNavigater';

const RoleManage: FC = () => {
	const { t } = useTranslation();
	const { navigateToAddRole } = useNavigater();
	// 顶部操作按钮配置
	const [tableData, setTableData] = useState<UserInfoVo[]>([]);
	const buttonConfigTop = [
		{
			id: 1,
			label: t('permission.addRole'),
			callback: navigateToAddRole,
			disabled: false
		}
	];
	//单条操作按钮配置;
	const buttonConfigItem = (text: [], record: UserInfoVo) => {
		const { UserId, Realname } = record;
		console.log(UserId, Realname);
		return [
			{
				id: 1,
				label: t('node.restart'),
				callback: () => {},
				disabled: false
			},
			{
				id: 2,
				label: t('node.remove'),
				callback: () => {},
				disabled: false
			}
		];
	};
	const columns: TableColumnsType<UserInfoVo> = [
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
			title: t('permission.updateTime'),
			dataIndex: 'EditEnabled',
			key: 'EditEnabled'
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
