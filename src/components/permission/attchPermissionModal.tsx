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
 * AttchPermissionModal - 为角色分配权限
 * @author Tracy
 */

import { FC, useState, useEffect } from 'react';
import { Modal, Form, Input, Transfer, message } from 'antd';
import type { TransferProps } from 'antd';
import _ from 'lodash';
import { t } from 'i18next';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import { PermissionVo, RoleVo } from '@/api/interface';

type FieldType = {
	Principal?: string;
	Credential?: string;
};
interface AttchPermissionModalProps {
	isModalOpen: boolean;
	role: RoleVo;
	handleCancel: () => void;
	handleOk: () => void;
}
const AttchPermissionModal: FC<AttchPermissionModalProps> = ({ isModalOpen, role, handleCancel, handleOk }) => {
	const [form] = Form.useForm();
	const [targetKeys, setTargetKeys] = useState<TransferProps['targetKeys']>();
	const [selectedKeys, setSelectedKeys] = useState<TransferProps['targetKeys']>([]);
	const [permissionList, setPermissionList] = useState<PermissionVo[]>([]);
	const [attachedList, setAttachedList] = useState<PermissionVo[]>([]);
	const [hasPermission, setHasPermission] = useState(false);
	const [messageApi] = message.useMessage();
	const getPermissionListByRoleId = async () => {
		const api = APIConfig.getPermissionListByRoleId;
		const {
			Data: { PermissionList }
		} = await RequestHttp.get(api, { params: { RoleId: role.RoleId } });
		const attchedPermissionList = PermissionList.map((permission: PermissionVo) => ({
			...permission,
			disabled: true
		}));
		const keys = PermissionList.map((role: PermissionVo) => role.PermissionId);
		setTargetKeys(keys);
		setAttachedList(attchedPermissionList);
		setPermissionList([...permissionList, ...attchedPermissionList]);
	};
	const getPermissionList = async () => {
		const api = APIConfig.getPermissionList;
		const {
			Data: { PermissionList }
		} = await RequestHttp.get(api);
		setPermissionList(PermissionList);
		setHasPermission(true);
	};
	useEffect(() => {
		hasPermission && getPermissionListByRoleId();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hasPermission]);
	useEffect(() => {
		getPermissionList();
	}, []);
	const onChange: TransferProps['onChange'] = nextTargetKeys => {
		console.log('targetKeys:', nextTargetKeys);
		setTargetKeys(nextTargetKeys);
	};
	const onSelectChange: TransferProps['onSelectChange'] = (sourceSelectedKeys, targetSelectedKeys) => {
		console.log('sourceSelectedKeys:', sourceSelectedKeys);
		console.log('targetSelectedKeys:', targetSelectedKeys);
		setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
	};
	const attchPermission = async () => {
		const values = form.getFieldsValue();
		console.log('Success:', values);

		const apiAttach = APIConfig.attachRole;
		const result = _.differenceWith(values.PermissionList, attachedList, (item1, item2) => item1 === item2.PermissionId);
		const RoleIdList = result.map((permissionId: string) => ({
			PermissionId: permissionId,
			RoleId: role.RoleId
		}));

		const paramsAttch = {
			PermissionRoleIdList: RoleIdList
		};
		const { Code, Data } = await RequestHttp.post(apiAttach, paramsAttch);
		console.log(Data);
		if (Code === '00000') {
			messageApi.success(t('messageSuccess'));
			handleOk(); // 刷新用户列表
			handleCancel(); // 关闭弹窗
		}
	};

	return (
		<Modal title={t('permission.assignPermission')} open={isModalOpen} onCancel={handleCancel} onOk={attchPermission}>
			<Form
				form={form}
				name="basic"
				labelCol={{ span: 4 }}
				wrapperCol={{ span: 20 }}
				style={{ maxWidth: 600 }}
				initialValues={{ RoleName: role.RoleName, PermissionList: selectedKeys }}
				autoComplete="off"
			>
				<Form.Item<FieldType>
					label={t('permission.roleName')}
					name="RoleName"
					rules={[{ required: true, message: 'Please input your username!' }]}
				>
					<Input readOnly />
				</Form.Item>

				<Form.Item<FieldType>
					label={t('permission.permission')}
					name="PermissionList"
					rules={[{ required: true, message: 'Please input your password!' }]}
				>
					<Transfer
						dataSource={permissionList}
						titles={['未选择', '已选择']}
						rowKey={record => record.PermissionId}
						targetKeys={targetKeys}
						selectedKeys={selectedKeys}
						onChange={onChange}
						onSelectChange={onSelectChange}
						// onScroll={onScroll}
						render={item => item.PermissionName}
						oneWay
						footer={() => null}
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};
export default AttchPermissionModal;
