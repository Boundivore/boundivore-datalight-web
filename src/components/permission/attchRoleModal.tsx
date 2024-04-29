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
import _ from 'lodash';
import { t } from 'i18next';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import { UserInfoVo, RoleVo } from '@/api/interface';

type FieldType = {
	Principal: string;
	RoleList: string[];
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
	const [attachedList, setAttachedList] = useState<RoleVo[]>([]);
	const [hasRoleList, setHasRoleList] = useState(false);
	const [messageApi, contextHolder] = message.useMessage();
	const getRoleListByUserId = async () => {
		const api = APIConfig.getRoleListByUserId;
		const {
			Data: { RoleList }
		} = await RequestHttp.get(api, { params: { UserId: user.UserId } });
		const attchedRoleList = RoleList.map((role: RoleVo) => ({
			...role,
			disabled: true
		}));
		const keys = RoleList.map((role: RoleVo) => role.RoleId);
		setTargetKeys(keys);
		setAttachedList(attchedRoleList);
		setRoleList([...roleList, ...attchedRoleList]);
	};
	const getRoleList = async () => {
		const api = APIConfig.getRoleList;
		const {
			Data: { RoleList }
		} = await RequestHttp.get(api);
		setRoleList(RoleList);
		setHasRoleList(true);
	};
	useEffect(() => {
		hasRoleList && getRoleListByUserId();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hasRoleList]);
	useEffect(() => {
		getRoleList();
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
	const attchRole = () => {
		// const { RoleList } = form.getFieldsValue();
		form.validateFields().then(async ({ RoleList }) => {
			const apiAttach = APIConfig.attachRole;
			const result = _.differenceWith(RoleList, attachedList, (item1, item2) => item1 === item2.RoleId);
			const RoleIdList = result.map((roleId: number | string) => ({
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
		});
	};
	const filterOption = (inputValue: string, option: RoleVo) => option.RoleName.indexOf(inputValue) > -1;

	return (
		<Modal title={t('permission.attachRole')} open={isModalOpen} onCancel={handleCancel} onOk={attchRole}>
			{contextHolder}
			<Form
				form={form}
				name="basic"
				labelCol={{ span: 4 }}
				wrapperCol={{ span: 20 }}
				style={{ maxWidth: 600 }}
				initialValues={{ Principal: user.Principal, RoleList: selectedKeys }}
				autoComplete="off"
			>
				<Form.Item<FieldType>
					label={t('permission.principal')}
					name="Principal"
					rules={[{ required: true, message: t('account.inputPrincipal') }]}
				>
					<Input disabled />
				</Form.Item>

				<Form.Item<FieldType> label={t('permission.role')} name="RoleList" rules={[{ required: true, message: t('inputRole') }]}>
					<Transfer
						dataSource={roleList}
						showSearch
						filterOption={filterOption}
						titles={['未选择', '已选择']}
						rowKey={record => record.RoleId}
						targetKeys={targetKeys}
						selectedKeys={selectedKeys}
						onChange={onChange}
						onSelectChange={onSelectChange}
						// onScroll={onScroll}
						render={item => <div className="data-light-role">{item.RoleName}</div>}
						// oneWay
					/>
				</Form.Item>
			</Form>
		</Modal>
	);
};
export default AttchRoleModal;
