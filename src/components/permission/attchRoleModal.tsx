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
 * AttchRoleModal - 绑定用户与角色
 * @author Tracy
 */

import { FC, useState, useEffect } from 'react';
import { Modal, Form, Input, Transfer, message } from 'antd';
import type { TransferProps } from 'antd';
import { t } from 'i18next';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import { UserInfoVo, RoleVo } from '@/api/interface';

type FieldType = {
	Principal?: string;
	Credential?: string;
};
interface AttchRoleModalProps {
	isModalOpen: boolean;
	user: UserInfoVo;
	handleCancel: () => void;
	handleOk: () => void;
}
const AttchRoleModal: FC<AttchRoleModalProps> = ({ isModalOpen, user, handleCancel, handleOk }) => {
	const [form] = Form.useForm();
	const [targetKeys, setTargetKeys] = useState<TransferProps['targetKeys']>();
	const [selectedKeys, setSelectedKeys] = useState<TransferProps['targetKeys']>([]);
	const [roleList, setRoleList] = useState<RoleVo[]>([]);
	const [messageApi] = message.useMessage();
	const getRoleListByUserId = async () => {
		const api = APIConfig.getRoleListByUserId;
		const {
			Data: { RoleList }
		} = await RequestHttp.get(api, { params: { UserId: user.UserId } });
		const keys = RoleList.map((role: RoleVo) => role.RoleId);
		setTargetKeys(keys);
	};
	const getRoleList = async () => {
		const api = APIConfig.getRoleList;
		const {
			Data: { RoleList }
		} = await RequestHttp.get(api);
		getRoleListByUserId();
		setRoleList(RoleList);
	};
	useEffect(() => {
		getRoleList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
	const attchRole = async () => {
		const values = form.getFieldsValue();
		console.log('Success:', values);

		const apiAttach = APIConfig.attachRole;
		const RoleIdList = values.RoleList.map((roleId: string) => ({
			RoleId: roleId,
			UserId: user.UserId
		}));

		const paramsAttch = {
			RoleUserList: RoleIdList
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
		<Modal title={t('permission.addUser')} open={isModalOpen} onCancel={handleCancel} onOk={attchRole}>
			<Form
				form={form}
				name="basic"
				labelCol={{ span: 4 }}
				wrapperCol={{ span: 20 }}
				style={{ maxWidth: 600 }}
				initialValues={{ RealName: user.Realname, RoleList: selectedKeys }}
				autoComplete="off"
			>
				<Form.Item<FieldType>
					label={t('login.principal')}
					name="RealName"
					rules={[{ required: true, message: 'Please input your username!' }]}
				>
					<Input />
				</Form.Item>

				<Form.Item<FieldType>
					label={t('permission.nickName')}
					name="RoleList"
					rules={[{ required: true, message: 'Please input your password!' }]}
				>
					<Transfer
						dataSource={roleList}
						titles={['Source', 'Target']}
						rowKey={record => record.RoleId}
						targetKeys={targetKeys}
						selectedKeys={selectedKeys}
						onChange={onChange}
						onSelectChange={onSelectChange}
						// onScroll={onScroll}
						render={item => item.RoleName}
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};
export default AttchRoleModal;
