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
 * PreviewconfigStep - 预览配置
 * @author Tracy.Guo
 */
import React, { useImperativeHandle, useEffect, useState, forwardRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Space, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
// import _ from 'lodash';
// import useStore from '@/store/store';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import useStore from '@/store/store';

interface DataType {
	ServiceName: string;
	ComponentName: string;
}

const PreviewconfigStep: React.FC = forwardRef((_props, ref) => {
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const { t } = useTranslation();
	const [serviceTable, setServiceTable] = useState([]);
	const { setJobId } = useStore();
	const serviceColumn: ColumnsType<DataType> = [
		{
			title: t('service.serviceName'),
			dataIndex: 'ServiceSummary',
			render: text => <a>{text?.ServiceName}</a>
		},
		{
			title: t('service.componentName'),
			dataIndex: 'ComponentName',
			render: text => <p>{text}</p>
		},
		{
			title: t('nodeNum'),
			dataIndex: 'ComponentNodeList',
			render: (text: []) => <span>{text?.length}</span>
		}
	];
	useImperativeHandle(ref, () => ({
		handleOk
	}));
	const handleOk = async () => {
		const api = APIConfig.deploy;
		const serviceNameList = serviceTable.map(item => item.rowKey);
		const params = {
			ActionTypeEnum: 'DEPLOY',
			ClusterId: id,
			IsOneByOne: false,
			ServiceNameList: serviceNameList
		};
		const data = await RequestHttp.post(api, params);
		setJobId(data.Data.JobId);
		return Promise.resolve(data);
	};
	const getInfo = async () => {
		const apiList = APIConfig.componentList;
		const params = {
			ClusterId: id
		};
		const data = await RequestHttp.get(apiList, { params });
		const {
			Data: { ServiceComponentSummaryList }
		} = data;
		const tableData = ServiceComponentSummaryList.map(
			(item: { rowKey: string; ServiceSummary: { ServiceName: string }; children: []; ComponentSummaryList: [] }) => {
				item.rowKey = item.ServiceSummary.ServiceName;
				item.children = item.ComponentSummaryList;
				return item;
			}
		);
		setServiceTable(tableData);
	};
	useEffect(() => {
		getInfo();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Space direction="vertical" size={16}>
			<Card title="集群信息">
				<p>Card content</p>
				<p>Card content</p>
				<p>Card content</p>
			</Card>
			<Card title="服务信息">
				<Table
					expandable={{ defaultExpandAllRows: true }}
					rowKey="rowKey"
					columns={serviceColumn}
					dataSource={serviceTable}
					scroll={{ y: '400px' }}
				></Table>
			</Card>
		</Space>
	);
});
export default PreviewconfigStep;
