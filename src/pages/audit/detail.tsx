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
 * AuditDetail 审计日志详情
 * @author Tracy
 */

import { FC, ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Card, Row, Col, List, Typography, Button, Space } from 'antd';
import ContainerCard from '@/components/containerCard';
// import { UserInfoVo } from '@/api/interface';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import useNavigater from '@/hooks/useNavigater';

const { Text } = Typography;

interface UserInfoItem {
	key: number;
	label: ReactNode;
	text: ReactNode;
}

const AuditDetail: FC = () => {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const { navigateToUserManage } = useNavigater();

	const [userInfoData, setUserInfoDataData] = useState<UserInfoItem[]>([]);
	// const [currentUser, setCurrentUser] = useState<UserInfoVo>({} as UserInfoVo);
	// const [ contextHolder] = message.useMessage();

	const getAuditDetail = async () => {
		const api = APIConfig.getAuditLogDetail;
		const params = {
			AuditLogId: id
		};
		const { Data } = await RequestHttp.get(api, { params });
		const UserInfo = [
			{
				key: 1,
				label: <Text strong>{t('audit.opName')}</Text>,
				text: <span>{Data.OpName}</span>
			},
			{
				key: 2,
				label: <Text strong>{t('audit.logType')}</Text>,
				text: <span>{Data.LogType}</span>
			},
			{
				key: 3,
				label: <Text strong>{t('audit.ip')}</Text>,
				text: <span>{Data.Ip}</span>
			},
			{
				key: 4,
				label: <Text strong>{t('audit.dateFormat')}</Text>,
				text: <span>{Data.DateFormat}</span>
			}
		];
		// setCurrentUser(Data);
		setUserInfoDataData(UserInfo);
	};
	useEffect(() => {
		getAuditDetail();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<ContainerCard>
			{/* {contextHolder} */}
			<Row gutter={24} className="mt-[20px]">
				<Col span={6}>
					<Card className="data-light-card" title={t('audit.detail')}>
						<List
							size="large"
							dataSource={userInfoData}
							renderItem={item => (
								<List.Item>
									{item.label}: {item.text}
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
								<Button onClick={navigateToUserManage}>{t('back')}</Button>
							</Space>
						}
					></Card>
				</Col>
			</Row>
		</ContainerCard>
	);
};
export default AuditDetail;
