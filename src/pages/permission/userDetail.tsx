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
 * UserDetail 用户详情
 * @author Tracy
 */

import { FC, Key, ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { Card, Row, Col, List, Typography, Button, Table, Space, Badge, App, message } from 'antd';
import type { TableColumnsType } from 'antd';
import ContainerCard from '@/components/containerCard';
import { UserInfoVo, RoleVo } from '@/api/interface';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import ChangePasswordModal from '@/components/permission/changePasswordModal';
import useNavigater from '@/hooks/useNavigater';

const { Text } = Typography;

interface UserInfoItem {
	key: number;
	label: ReactNode;
	text: ReactNode;
}

const UserDetail: FC = () => {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const { navigateToUserManage } = useNavigater();

	const [userInfoData, setUserInfoDataData] = useState<UserInfoItem[]>([]);
	const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
	const [currentUser, setCurrentUser] = useState<UserInfoVo>({} as UserInfoVo);
	const [tableData, setTableData] = useState<RoleVo[]>([]);
	const [selectedRole, setSelectedRole] = useState<Key[]>([]);
	const { modal } = App.useApp();
	const [messageApi, contextHolder] = message.useMessage();
	//单条操作按钮配置;
	const buttonConfigItem = (record: RoleVo) => {
		const { RoleId } = record;
		return [
			{
				id: 1,
				label: t('permission.detachRole'),
				callback: () => detachRole([RoleId]),
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
			render: (_text, record) => {
				return (
					<Space>
						{buttonConfigItem(record).map(button => (
							<Button key={button.id} type="primary" size="small" ghost disabled={button.disabled} onClick={button.callback}>
								{button.label}
							</Button>
						))}
					</Space>
				);
			}
		}
	];
	const detachRole = (roleIdList: (string | Key)[]) => {
		modal.confirm({
			title: t('permission.detachRole'),
			content: t('permission.detachRoleConfirm2'),
			okText: t('confirm'),
			cancelText: t('cancel'),
			onOk: async () => {
				const api = APIConfig.detachRoleUserByUserId;
				const idList = roleIdList.map(roleId => ({
					UserId: id,
					RoleId: roleId
				}));
				const params = {
					RoleUserList: idList
				};
				const { Code } = await RequestHttp.post(api, params);
				if (Code === '00000') {
					messageApi.success(t('messageSuccess'));
					getRoleList(); //操作成功更新列表
				}
			}
		});
	};
	const getUserDetail = async () => {
		const api = APIConfig.getUserDetailById;
		const params = {
			UserId: id
		};
		const { Data } = await RequestHttp.get(api, { params });
		const UserInfo = [
			{
				key: 1,
				label: <Text strong>{t('permission.principal')}</Text>,
				text: <span>{Data.Principal}</span>
			},
			{
				key: 2,
				label: <Text strong>{t('permission.realName')}</Text>,
				text: <span>{Data.Realname}</span>
			},
			{
				key: 3,
				label: <Text strong>{t('permission.nickName')}</Text>,
				text: <span>{Data.Nickname}</span>
			},
			{
				key: 4,
				label: <Text strong>{t('permission.createTime')}</Text>,
				text: dayjs.unix(Data.CreateTime / 1000).format('YYYY-MM-DD HH:mm:ss')
			},
			{
				key: 5,
				label: <Text strong>{t('permission.updateTime')}</Text>,
				text: dayjs.unix(Data.UpdateTime / 1000).format('YYYY-MM-DD HH:mm:ss')
			}
		];
		setCurrentUser(Data);
		setUserInfoDataData(UserInfo);
	};
	const getRoleList = async () => {
		const api = APIConfig.getRoleListByUserId;
		const {
			Data: { RoleList }
		} = await RequestHttp.get(api, { params: { UserId: id } });
		setTableData(RoleList);
	};
	useEffect(() => {
		getUserDetail();
		getRoleList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	const rowSelection = {
		onChange: (selectedRowKeys: Key[]) => {
			setSelectedRole(selectedRowKeys);
		},
		selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE]
	};
	return (
		<ContainerCard>
			{contextHolder}
			<Row gutter={24} className="mt-[20px]">
				<Col span={6}>
					<Card className="data-light-card" title="用户信息">
						<List
							size="large"
							dataSource={userInfoData}
							renderItem={item => (
								<List.Item>
									<div className="inline-block w-[70px]">{item.label}:</div> {item.text}
								</List.Item>
							)}
						/>
					</Card>
				</Col>
				<Col span={18}>
					<Card
						className="data-light-card"
						title="已绑定角色"
						extra={
							<Space>
								<Button type="primary" disabled={!selectedRole.length} onClick={() => detachRole(selectedRole)}>
									{t('permission.batchDetachRole')}
								</Button>
								<Button onClick={navigateToUserManage}>{t('back')}</Button>
							</Space>
						}
					>
						<h4>{t('totalItems', { total: tableData.length, selected: selectedRole.length })}</h4>
						<Table
							rowKey="RoleId"
							rowSelection={{
								...rowSelection
							}}
							dataSource={tableData}
							columns={columns}
							pagination={{
								showSizeChanger: true,
								total: tableData.length,
								showTotal: total => t('totalItems', { total, selected: selectedRole.length })
							}}
						/>
					</Card>
				</Col>
			</Row>

			{isChangePasswordModalOpen ? (
				<ChangePasswordModal
					isModalOpen={isChangePasswordModalOpen}
					user={currentUser}
					handleCancel={() => setIsChangePasswordModalOpen(false)}
					// handleOk={getUserList}
				/>
			) : null}
		</ContainerCard>
	);
};
export default UserDetail;
