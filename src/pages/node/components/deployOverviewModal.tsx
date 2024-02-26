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
import { Table, Modal, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import APIConfig from '@/api/config';
import RequestHttp from '@/api';

interface DeployOverviewProps {
	isModalOpen: boolean;
	handleCancel: () => void;
}
interface DataType {
	ServiceName: string;
	ComponentName: string;
}

const DeployOverview: React.FC<DeployOverviewProps> = ({ isModalOpen, handleCancel }) => {
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const { t } = useTranslation();
	const [serviceTable, setServiceTable] = useState([]);
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
		<Modal
			title={t('deployInfoView')}
			open={isModalOpen}
			onCancel={handleCancel}
			footer={[
				<Button key="cancel" onClick={handleCancel}>
					{t('close')}
				</Button>
			]}
		>
			{/* <Space> */}
			{/* <Table></Table> */}
			<Table
				expandable={{ defaultExpandAllRows: true }}
				rowKey="rowKey"
				columns={serviceColumn}
				dataSource={serviceTable}
				size="small"
				scroll={{ y: '400px' }}
			></Table>
			{/* <Button onClick={handleCancel}>关闭</Button> */}
			{/* </Space> */}
		</Modal>
	);
};

export default DeployOverview;
