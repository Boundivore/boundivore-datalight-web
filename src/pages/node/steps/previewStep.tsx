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
import useStepLogic from '@/hooks/useStepLogic';
import useStore from '@/store/store';
import { ServiceComponentSummaryVo, ComponentNodeVo } from '@/api/interface';
import JobPlanModal from '../../../components/jobPlanModal';

interface TableDataType extends ServiceComponentSummaryVo {
	rowKey: string;
	children: [];
}
// const deployedState = [];
const undeployedState = ['REMOVED', 'SELECTED', 'UNSELECTED'];
const serviceDeployState = ['SELECTED', 'SELECTED_ADDITION'];
// const preStepName = 'previewStep'; // 当前步骤页面基于上一步的输入和选择生成
const stepName = 'previewStep';
const operation = 'DEPLOY';
const PreviewStep: React.FC = forwardRef((_props, ref) => {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const [serviceTable, setServiceTable] = useState<TableDataType[]>([]);
	const [filterData, setFilterData] = useState<string[]>([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const { setCurrentPageDisabled, currentPageDisabled, setJobId } = useStore();
	const { useSetStepData } = useStepLogic();
	const serviceColumn: ColumnsType<TableDataType> = [
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
			title: t('undeployedNodeNum'),
			dataIndex: 'ComponentNodeList',
			render: (text: ComponentNodeVo[]) => <span>{text?.filter(node => undeployedState.includes(node.SCStateEnum)).length}</span>
		},
		{
			title: t('deployedNodeNum'),
			dataIndex: 'ComponentNodeList',
			render: (text: ComponentNodeVo[]) => <span>{text?.filter(node => !undeployedState.includes(node.SCStateEnum)).length}</span>
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
	const setStepData = useSetStepData(stepName, null, filterData);
	const handleOk = async () => {
		setStepData();
		deploy();
	};
	const deploy = async () => {
		setIsModalOpen(true);
		const api = APIConfig.deploy;
		const params = {
			ActionTypeEnum: operation,
			ClusterId: id,
			IsOneByOne: false,
			ServiceNameList: filterData
		};
		const data = await RequestHttp.post(api, params);
		setJobId(data.Data.JobId);
	};
	const handleModalOk = () => {
		setIsModalOpen(false);
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
		const tableData: TableDataType[] = ServiceComponentSummaryList.map((item: ServiceComponentSummaryVo) => ({
			...item,
			rowKey: item.ServiceSummary.ServiceName,
			children: item.ComponentSummaryList
		}));
		const filterServiceName = tableData
			.filter(item1 => {
				return serviceDeployState.includes(item1.ServiceSummary.SCStateEnum);
			})
			.map(item2 => {
				return item2.ServiceSummary.ServiceName;
			});
		setFilterData(filterServiceName);
		setServiceTable(tableData);
		setCurrentPageDisabled({
			...currentPageDisabled,
			nextDisabled: !filterServiceName.length,
			prevDisabled: false,
			cancelDisabled: false
		});
	};
	useEffect(() => {
		getInfo();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Space direction="vertical" size={16}>
			{/* <Card title="集群信息">
				<p>Card content</p>
				<p>Card content</p>
				<p>Card content</p>
			</Card> */}
			<Card title="服务信息">
				<Table
					expandable={{ defaultExpandAllRows: true }}
					rowKey="rowKey"
					columns={serviceColumn}
					dataSource={serviceTable}
					scroll={{ y: '400px' }}
				></Table>
			</Card>
			{isModalOpen ? (
				<JobPlanModal
					isModalOpen={isModalOpen}
					handleOk={handleModalOk}
					// nodeList={nodeList}
				/>
			) : null}
		</Space>
	);
});
export default PreviewStep;
