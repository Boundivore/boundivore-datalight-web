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
 * DeployOverview - 部署信息预览
 * @author Tracy.Guo
 */
import { useEffect, useState } from 'react';
import { Table, Modal } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import APIConfig from '@/api/config';
import RequestHttp from '@/api';
const DeployOverview: React.FC = ({ isModalOpen, handleOk, handleCancel }) => {
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const { t } = useTranslation();
	const [serviceTable, setServiceTable] = useState([]);
	const serviceColumn = [
		{
			title: t('node.node'),
			dataIndex: 'ServiceSummary',
			render: (text: {}) => <a>{text?.ServiceName}</a>
		},
		{
			title: t('node.config'),
			dataIndex: 'ComponentName',
			render: (text: {}) => <p>{text}</p>
		},
		{
			title: t('node.config'),
			dataIndex: 'ComponentNodeList',
			render: (text: []) => <span>{text?.length}</span>
		}
	];
	const getInfo = async () => {
		const apiList = APIConfig.componentList;
		const params = {
			ClusterId: id
		};
		const data = await RequestHttp.get(apiList, { params });
		// @ts-ignore
		const tableData = data.Data.ServiceComponentSummaryList.map(item => {
			item.rowKey = item.ServiceSummary.ServiceName;
			item.children = item.ComponentSummaryList;
			return item;
		});
		setServiceTable(tableData);
		console.log(111, data);
	};
	useEffect(() => {
		getInfo();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<Modal title="Basic Modal" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
			{/* <Space> */}
			{/* <Table></Table> */}
			<Table
				expandable={{ defaultExpandAllRows: true }}
				rowKey="rowKey"
				columns={serviceColumn}
				dataSource={serviceTable}
			></Table>
			{/* </Space> */}
		</Modal>
	);
};

export default DeployOverview;
