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
 * UserManage 用户管理
 * @author Tracy
 */

import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Button, Flex, Space, App, message } from 'antd';
import type { TableColumnsType } from 'antd';
import ContainerCard from '@/components/containerCard';
import { UserInfoVo } from '@/api/interface';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import AddUserModal from '@/components/permission/addUserModal';
import AttchRoleModal from '@/components/permission/attchRoleModal';

const UserManage: FC = () => {
	const { t } = useTranslation();
	// 顶部操作按钮配置
	const [tableData, setTableData] = useState<UserInfoVo[]>([]);
	const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
	const [isAttchRoleModalOpen, setIsAttchRoleModalOpen] = useState(false);
	const [currentUser, setCurrentUser] = useState<UserInfoVo>({} as UserInfoVo);
	const { modal } = App.useApp();
	const [messageApi] = message.useMessage();
	const buttonConfigTop = [
		{
			id: 1,
			label: t('permission.addUser'),
			callback: () => setIsAddUserModalOpen(true),
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
				label: t('detail'),
				callback: () => {},
				disabled: false
			},
			{
				id: 2,
				label: t('permission.asignRole'),
				callback: () => {
					setCurrentUser(record);
					setIsAttchRoleModalOpen(true);
				},
				disabled: false
			},
			{
				id: 3,
				label: t('permission.removeUser'),
				callback: () => removeUser(record.UserId),
				disabled: false
			}
		];
	};
	const columns: TableColumnsType<UserInfoVo> = [
		{
			title: t('permission.userName'),
			dataIndex: 'Realname',
			key: 'Realname'
		},
		{
			title: t('permission.createTime'),
			dataIndex: 'CreateTime',
			key: 'CreateTime'
		},
		{
			title: t('permission.updateTime'),
			dataIndex: 'UpdateTime',
			key: 'UpdateTime'
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
	const removeUser = (userId: string | number) => {
		modal.confirm({
			title: t('node.remove'),
			content: t('node.removeConfirm'),
			okText: t('confirm'),
			cancelText: t('cancel'),
			onOk: async () => {
				const api = APIConfig.removeUser;
				const params = {
					UserId: userId
				};
				const { Code } = await RequestHttp.post(api, params);
				if (Code === '00000') {
					messageApi.success(t('messageSuccess'));
				}
			}
		});
	};

	const getUserList = async () => {
		const api = APIConfig.getUserDetailList;
		const {
			Data: { UserInfoList }
		} = await RequestHttp.get(api);
		setTableData(UserInfoList);
	};
	useEffect(() => {
		getUserList();
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
				rowKey="UserId"
				// rowSelection={{
				// 	...rowSelection
				// }}
				columns={columns}
				dataSource={tableData}
			/>
			{isAddUserModalOpen ? (
				<AddUserModal isModalOpen={isAddUserModalOpen} handleCancel={() => setIsAddUserModalOpen(false)} handleOk={getUserList} />
			) : null}
			{isAttchRoleModalOpen ? (
				<AttchRoleModal
					isModalOpen={isAttchRoleModalOpen}
					user={currentUser}
					handleCancel={() => setIsAttchRoleModalOpen(false)}
					handleOk={getUserList}
				/>
			) : null}
		</ContainerCard>
	);
};
export default UserManage;
