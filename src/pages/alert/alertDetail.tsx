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
 * 告警规则详情和编辑
 * @author Tracy
 */
import { FC, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { t } from 'i18next';
import { Row, Col, Card, List, Typography, Badge } from 'antd';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import ContainerCard from '@/components/containerCard';
import AlertForm from '@/components/alert/alertForm';
const { Text } = Typography;

const AlertDetail: FC = () => {
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const [alertInfoData, setAlertInfoData] = useState([]);
	// const { modal } = App.useApp();
	// const [messageApi, contextHolder] = message.useMessage();
	const getAlertDetail = async () => {
		const api = APIConfig.getAlertDetailById;
		const params = {
			AlertId: id
		};
		const { Data } = await RequestHttp.get(api, { params });
		// console.log(data);
		const alertInfo = [
			{
				key: 1,
				label: <Text strong>{t('permission.roleName')}</Text>,
				text: <span>{Data.AlertRuleName}</span>
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
		setAlertInfoData(alertInfo);
	};
	useEffect(() => {
		id && getAlertDetail();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);
	return (
		<ContainerCard>
			{/* {contextHolder} */}
			<Row gutter={24} className="mt-[20px]">
				<Col span={6}>
					<Card className="data-light-card" title="角色信息">
						<List
							size="large"
							dataSource={alertInfoData}
							renderItem={item => (
								<List.Item>
									{item.label}: {item.text}
								</List.Item>
							)}
						/>
					</Card>
				</Col>
				<Col span={18}>
					<Card>
						<AlertForm />
					</Card>
				</Col>
			</Row>
		</ContainerCard>
	);
};
export default AlertDetail;
