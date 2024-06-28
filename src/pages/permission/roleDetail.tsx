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
 * RoleDetail 角色详情
 * @author Tracy
 */

import { FC, Key, ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Card, Row, Col, List, Typography, Button, Table, Space, Badge, App, message } from 'antd';
import type { TableColumnsType } from 'antd';
import ContainerCard from '@/components/containerCard';
import { PermissionVo } from '@/api/interface';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import useNavigater from '@/hooks/useNavigater';

const { Text } = Typography;
interface RoleInfoItem {
	key: number;
	label: ReactNode;
	text: ReactNode;
}

const RoleDetail: FC = () => {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const { navigateToRoleManage } = useNavigater();

	const [roleInfoData, setRoleInfoDataData] = useState<RoleInfoItem[]>([]);
	const [tableData, setTableData] = useState<PermissionVo[]>([]);
	const [selectedPermission, setSelectedPermission] = useState<Key[]>([]);
	const { modal } = App.useApp();
	const [messageApi, contextHolder] = message.useMessage();
	//单条操作按钮配置;
	const buttonConfigItem = (record: PermissionVo) => {
		const { PermissionId } = record;
		return [
			{
				id: 1,
				label: t('permission.detachPermission'),
				callback: () => detachPermission([PermissionId]),
				disabled: false
			}
		];
	};
	const columns: TableColumnsType<PermissionVo> = [
		{
			title: t('permission.permissionName'),
			dataIndex: 'PermissionName',
			key: 'PermissionName'
		},
		{
			title: t('permission.permissionType'),
			dataIndex: 'PermissionType',
			key: 'PermissionType',
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
	const detachPermission = (permissionIdList: (string | Key)[]) => {
		modal.confirm({
			title: t('permission.detachPermission'),
			content: t('permission.detachPermissionConfirm2'),
			okText: t('confirm'),
			cancelText: t('cancel'),
			onOk: async () => {
				const api = APIConfig.detachPermissionRoleByPermissionRoleId;
				const idList = permissionIdList.map(permissionId => ({
					RoleId: id,
					PermissionId: permissionId
				}));
				const params = {
					PermissionRoleIdList: idList
				};
				const { Code } = await RequestHttp.post(api, params);
				if (Code === '00000') {
					messageApi.success(t('messageSuccess'));
					getPermissionList(); //操作成功更新列表
				}
			}
		});
	};
	const getRoleDetail = async () => {
		const api = APIConfig.getRoleById;
		const params = {
			RoleId: id
		};
		const { Data } = await RequestHttp.get(api, { params });
		const roleInfo = [
			{
				key: 1,
				label: <Text strong>{t('permission.roleName')}</Text>,
				text: <span>{Data.RoleName}</span>
			},
			{
				key: 2,
				label: <Text strong>{t('permission.roleDes')}</Text>,
				text: <span>{Data.RoleComment}</span>
			},
			{
				key: 3,
				label: <Text strong>{t('permission.roleType')}</Text>,
				text: <span>{t(`permission.${Data.RoleType}`)}</span>
			},
			{
				key: 4,
				label: <Text strong>{t('state')}</Text>,
				text: (
					<Badge
						status={Data.Enabled ? 'success' : 'error'}
						text={Data.Enabled ? t(`permission.enabled`) : t(`permission.disabled`)}
					/>
				)
			}
		];
		setRoleInfoDataData(roleInfo);
	};
	const getPermissionList = async () => {
		const api = APIConfig.getPermissionListByRoleId;
		const {
			Data: { PermissionList }
		} = await RequestHttp.get(api, { params: { RoleId: id } });
		setTableData(PermissionList);
	};
	useEffect(() => {
		getRoleDetail();
		getPermissionList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	const rowSelection = {
		onChange: (selectedRowKeys: Key[]) => {
			setSelectedPermission(selectedRowKeys);
		},
		selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE]
	};
	return (
		<ContainerCard>
			{contextHolder}
			<Row gutter={24} className="mt-[20px]">
				<Col span={6}>
					<Card className="data-light-card" title="角色信息">
						<List
							size="large"
							dataSource={roleInfoData}
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
						title="已分配权限"
						extra={
							<Space>
								<Button type="primary" disabled={!selectedPermission.length} onClick={() => detachPermission(selectedPermission)}>
									{t('permission.batchDetachPermission')}
								</Button>
								<Button onClick={navigateToRoleManage}>{t('back')}</Button>
							</Space>
						}
					>
						<h4>{t('totalItems', { total: tableData.length, selected: selectedPermission.length })}</h4>
						<Table
							rowSelection={{
								...rowSelection
							}}
							dataSource={tableData}
							columns={columns}
							rowKey="PermissionId"
							pagination={{
								showSizeChanger: true,
								total: tableData.length,
								showTotal: total => t('totalItems', { total, selected: selectedPermission.length })
							}}
						/>
					</Card>
				</Col>
			</Row>
		</ContainerCard>
	);
};
export default RoleDetail;
