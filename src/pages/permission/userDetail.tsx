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

import { FC, useEffect, useState } from 'react';
// import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
// import { App, message, Descriptions } from 'antd';
import { Card, Descriptions, Row, Col, List, Typography } from 'antd';
import type { DescriptionsProps } from 'antd';
import ContainerCard from '@/components/containerCard';
import { UserInfoVo } from '@/api/interface';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import AttchRoleModal from '@/components/permission/attchRoleModal';
import ChangePasswordModal from '@/components/permission/changePasswordModal';

const UserDetail: FC = () => {
	// const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	// 顶部操作按钮配置
	const [userInfoData, setUserInfoDataData] = useState([]);
	const [isAttchRoleModalOpen, setIsAttchRoleModalOpen] = useState(false);
	const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
	const [currentUser, setCurrentUser] = useState<UserInfoVo>({} as UserInfoVo);
	// const { modal } = App.useApp();
	// const [messageApi, contextHolder] = message.useMessage();

	const getUserDetail = async () => {
		const api = APIConfig.getUserDetailById;
		const params = {
			UserId: id
		};
		const { Data } = await RequestHttp.get(api, { params });
		const UserInfo: DescriptionsProps['items'] = [
			{
				key: 1,
				label: '账号',
				children: Data.Principal
			},
			{
				key: 2,
				label: '账号',
				children: Data.Principal
			},
			{
				key: 3,
				label: '账号',
				children: Data.Principal
			},
			{
				key: 4,
				label: '创建时间',
				children: Data.Principal
			}
		];
		setCurrentUser(Data);
		setUserInfoDataData(UserInfo);
	};
	useEffect(() => {
		getUserDetail();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<ContainerCard>
			<Row gutter={24} className="mt-[20px]">
				<Col span={6}>
					<Card className="data-light-card">
						<List
							size="large"
							header={
								<Typography.Title level={5} style={{ margin: 0 }}>
									用户信息
								</Typography.Title>
							}
							dataSource={userInfoData}
							renderItem={item => (
								<List.Item>
									{item.label}: {item.children}
								</List.Item>
							)}
						/>
					</Card>
				</Col>
				<Col span={18}>
					<Card className="data-light-card">
						<Descriptions style={{ padding: 15 }} title="用户权限" items={userInfoData} />
					</Card>
				</Col>
			</Row>

			{/* {contextHolder} */}
			{isAttchRoleModalOpen ? (
				<AttchRoleModal
					isModalOpen={isAttchRoleModalOpen}
					user={currentUser}
					handleCancel={() => setIsAttchRoleModalOpen(false)}
					handleOk={getUserDetail}
				/>
			) : null}
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
