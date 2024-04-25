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
 * addRole 新增角色
 * @author Tracy
 */

import { FC, useEffect, useState } from 'react';
import { t } from 'i18next';
import { Form, Transfer, Input, Select, Button, Space, Switch } from 'antd';
import type { TransferProps, FormProps } from 'antd';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import ContainerCard from '@/components/containerCard';
import { PermissionVo } from '@/api/interface';

type FieldType = {
	RoleName: string;
	RoleComment?: string;
	RoleType: string;
	PermissionId: string[];
};
const roleType = [
	{ value: 'ROLE_DYNAMIC', label: <span>ROLE_DYNAMIC</span> },
	{ value: 'ROLE_STATIC', label: <span>ROLE_STATIC</span> }
];
const AddRole: FC = () => {
	const [form] = Form.useForm();
	const [targetKeys, setTargetKeys] = useState<TransferProps['targetKeys']>();
	const [selectedKeys, setSelectedKeys] = useState<TransferProps['targetKeys']>([]);
	const [permissionList, setPermissionList] = useState<PermissionVo[]>([]);
	const getPermissionList = async () => {
		const api = APIConfig.getPermissionList;
		const {
			Data: { PermissionList }
		} = await RequestHttp.get(api);
		setPermissionList(PermissionList);
	};
	const onChange: TransferProps['onChange'] = nextTargetKeys => {
		console.log('targetKeys:', nextTargetKeys);
		setTargetKeys(nextTargetKeys);
	};
	const onSelectChange: TransferProps['onSelectChange'] = (sourceSelectedKeys, targetSelectedKeys) => {
		console.log('sourceSelectedKeys:', sourceSelectedKeys);
		console.log('targetSelectedKeys:', targetSelectedKeys);
		setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
	};
	const onFinish: FormProps<FieldType>['onFinish'] = async values => {
		console.log('Success:', values);
		const api = APIConfig.newRole;
		const params = {
			Enabled: false,
			RoleComment: values.RoleComment,
			RoleName: values.RoleName,
			RoleType: values.RoleType
		};
		const {
			Data: { RoleId }
		} = await RequestHttp.post(api, params);
		if (RoleId) {
			const apiAttach = APIConfig.attachPermission;
			const PermissionIdList = values.PermissionId.map(permissionId => ({
				PermissionId: permissionId,
				RoleId
			}));

			const paramsAttch = {
				PermissionRoleIdList: PermissionIdList
			};
			const { Data } = await RequestHttp.post(apiAttach, paramsAttch);
			console.log(Data);
		}
	};

	useEffect(() => {
		getPermissionList();
	}, []);
	return (
		<ContainerCard>
			<Form
				form={form}
				name="basic"
				className="pt-[50px]"
				labelCol={{ span: 8 }}
				wrapperCol={{ span: 16 }}
				style={{ maxWidth: 600 }}
				autoComplete="off"
				onFinish={onFinish}
			>
				<Form.Item<FieldType>
					label={t('permission.roleName')}
					name="RoleName"
					rules={[{ required: true, message: 'Please input your username!' }]}
				>
					<Input />
				</Form.Item>
				<Form.Item<FieldType>
					label={t('permission.roleDes')}
					name="RoleComment"
					rules={[{ required: true, message: 'Please input your username!' }]}
				>
					<Input />
				</Form.Item>
				<Form.Item<FieldType>
					label={t('permission.roleType')}
					name="RoleType"
					rules={[{ required: true, message: 'Please input your username!' }]}
				>
					<Select options={roleType} />
				</Form.Item>
				<Form.Item<FieldType>
					label={t('permission.roleType')}
					name="Enabled"
					valuePropName="checked"
					rules={[{ required: true, message: 'Please input your username!' }]}
				>
					<Switch />
				</Form.Item>
				<Form.Item<FieldType>
					label={t('login.principal')}
					name="PermissionId"
					rules={[{ required: true, message: 'Please input your username!' }]}
				>
					<Transfer
						dataSource={permissionList}
						titles={['Source', 'Target']}
						rowKey={record => record.PermissionId}
						targetKeys={targetKeys}
						selectedKeys={selectedKeys}
						onChange={onChange}
						onSelectChange={onSelectChange}
						// onScroll={onScroll}
						render={item => item.PermissionName}
					/>
				</Form.Item>
				<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
					<Space>
						<Button>{t('cancel')}</Button>
						<Button type="primary" htmlType="submit">
							{t('submit')}
						</Button>
					</Space>
				</Form.Item>
			</Form>
		</ContainerCard>
	);
};
export default AddRole;
