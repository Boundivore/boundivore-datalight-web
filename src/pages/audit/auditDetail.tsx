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
import Base64 from 'crypto-js/enc-base64';
import Utf8 from 'crypto-js/enc-utf8';
import JsonView from '@uiw/react-json-view';
import ContainerCard from '@/components/containerCard';
// import { UserInfoVo } from '@/api/interface';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import useNavigater from '@/hooks/useNavigater';

const { Text } = Typography;

interface AuditInfoItem {
	key: number;
	label: ReactNode;
	text: ReactNode;
}

const AuditDetail: FC = () => {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const { navigateToAudit } = useNavigater();

	const [auditInfoData, setAuditInfoDataData] = useState<AuditInfoItem[]>([]);
	const [paramsView, setParamsView] = useState([]);
	const [resultView, setResultView] = useState({});
	const [uri, setUri] = useState('');

	const getAuditDetail = async () => {
		const api = APIConfig.getAuditLogDetail;
		const params = {
			AuditLogId: id
		};
		const {
			Data: { ParamsBase64, ResultBase64, Principal, OpName, LogType, Ip, DateFormat, Uri, UserId }
		} = await RequestHttp.get(api, { params });
		const auditInfo = [
			{
				key: 1,
				label: <Text strong>{t('audit.opName')}</Text>,
				text: <span>{OpName}</span>
			},
			{
				key: 2,
				label: <Text strong>{t('audit.logType')}</Text>,
				text: <span>{LogType}</span>
			},
			{
				key: 3,
				label: <Text strong>{t('userId')}</Text>,
				text: <span>{UserId}</span>
			},
			{
				key: 4,
				label: <Text strong>{t('audit.ip')}</Text>,
				text: <span>{Ip}</span>
			},
			{
				key: 5,
				label: <Text strong>{t('audit.principal')}</Text>,
				text: <span>{Principal}</span>
			},
			{
				key: 6,
				label: <Text strong>{t('audit.dateFormat')}</Text>,
				text: <span>{DateFormat}</span>
			}
		];
		const paramsInput = JSON.parse(Utf8.stringify(Base64.parse(ParamsBase64)));
		const result = JSON.parse(Utf8.stringify(Base64.parse(ResultBase64)));
		setUri(Uri);
		setParamsView(paramsInput);
		setResultView(result);
		setAuditInfoDataData(auditInfo);
	};
	useEffect(() => {
		getAuditDetail();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<ContainerCard>
			<Row gutter={24} className="mt-[20px]">
				<Col span={6}>
					<Card className="data-light-card" title={t('audit.detail')}>
						<List
							size="large"
							dataSource={auditInfoData}
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
						title="审计日志详情"
						extra={
							<Space>
								<Button onClick={navigateToAudit}>{t('back')}</Button>
							</Space>
						}
					>
						<h3>URI: {uri}</h3>
						<Card title="参数">
							<JsonView value={paramsView} />
						</Card>
						<Card title="响应结果">
							<JsonView value={resultView} />
						</Card>
					</Card>
				</Col>
			</Row>
		</ContainerCard>
	);
};
export default AuditDetail;
