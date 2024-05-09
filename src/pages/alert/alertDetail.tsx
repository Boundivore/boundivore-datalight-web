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
import { Row, Col, Card, List, Typography, Badge, Space, Button } from 'antd';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import ContainerCard from '@/components/containerCard';
import AlertForm from '@/components/alert/alertForm';
import useNavigater from '@/hooks/useNavigater';
const { Text } = Typography;

const AlertDetail: FC = () => {
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const { navigateToAlertList } = useNavigater();
	const [alertInfoData, setAlertInfoData] = useState([]);
	const [alertRuleData, setAlertRuleData] = useState(null);
	// const { modal } = App.useApp();
	// const [messageApi, contextHolder] = message.useMessage();
	const getAlertDetail = async () => {
		const api = APIConfig.getAlertDetailById;
		const params = {
			AlertId: id
		};
		const {
			Data: { AlertRuleContent, AlertRuleName, Enabled }
		} = await RequestHttp.get(api, { params });
		// console.log(data);
		const alertInfo = [
			{
				key: 1,
				label: <Text strong>{t('permission.roleName')}</Text>,
				text: <span>{AlertRuleName}</span>
			},
			// {
			// 	key: 3,
			// 	label: <Text strong>{t('permission.roleType')}</Text>,
			// 	text: <span>{t(`permission.${Data.RoleType}`)}</span>
			// },
			{
				key: 2,
				label: <Text strong>{t('state')}</Text>,
				text: <Badge status={Enabled ? 'success' : 'error'} text={Enabled ? t(`permission.enabled`) : t(`permission.disabled`)} />
			}
		];
		setAlertInfoData(alertInfo);
		setAlertRuleData({ AlertRuleName, AlertRuleContent });
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
					<Card className="data-light-card" title="告警配置信息">
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
					<Card
						title="告警规则信息"
						extra={
							<Space>
								{/* <Button type="primary" disabled={!selectedPermission.length} onClick={() => detachPermission(selectedPermission)}>
									{t('permission.batchDetachPermission')}
								</Button> */}
								<Button onClick={navigateToAlertList}>{t('back')}</Button>
							</Space>
						}
					>
						{alertRuleData && <AlertForm type="edit" alertRuleData={alertRuleData} />}
					</Card>
				</Col>
			</Row>
		</ContainerCard>
	);
};
export default AlertDetail;
