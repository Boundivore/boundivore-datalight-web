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
 * SelectServiceStep - 选择服务步骤
 * @author Tracy
 */
import { forwardRef, useImperativeHandle, useEffect, useState, Key } from 'react';
import _ from 'lodash';
import { useSearchParams } from 'react-router-dom';
import { Table, Badge } from 'antd';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import useStore from '@/store/store';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import { BadgeStatus, ServiceItemType } from '@/api/interface';

const selectedStates = ['SELECTED', 'SELECTED_ADDITION']; // 默认选中的状态
const SelectServiceStep = forwardRef((_props, ref) => {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const serviceName = searchParams.get('service');
	const { selectedServiceRowsList, setSelectedServiceRowsList, stateText, setCurrentPageDisabled, currentPageDisabled } =
		useStore();
	const [tableData, setTableData] = useState<ServiceItemType[]>([]);
	const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
	const columns: ColumnsType<ServiceItemType> = [
		{
			title: t('service.serviceName'),
			dataIndex: 'ServiceName',
			render: text => (
				<div className="flex items-center">
					<img src={`/service_logo/${text.toLowerCase()}.svg`} width="16" height="16" />
					<span className="pl-[5px]">{text}</span>
				</div>
			)
		},
		{
			title: t('description'),
			dataIndex: 'Desc'
		},
		{
			title: t('node.state'),
			dataIndex: 'SCStateEnum',
			render: (text: string) => <Badge status={stateText[text].status as BadgeStatus} text={t(stateText[text].label)} />
		}
	];
	useImperativeHandle(ref, () => ({
		handleOk
	}));
	const handleOk = async () => {
		const apiSelect = APIConfig.selectService;
		// 合并原数据和本次操作选择的数据
		const combinedArray = selectedServiceRowsList.concat(
			tableData
				.filter(itemA => !selectedServiceRowsList.some(itemB => itemA.ServiceName === itemB.ServiceName))
				.map(item => ({ ...item, SCStateEnum: 'UNSELECTED' }))
		);
		const params = {
			ClusterId: id,
			ServiceList: combinedArray.map(({ SCStateEnum, ServiceName }) => ({ SCStateEnum, ServiceName }))
		};
		const jobData = await RequestHttp.post(apiSelect, params);
		return Promise.resolve(jobData);
	};

	const getList = async () => {
		const apiList = APIConfig.serviceList;
		const params = {
			ClusterId: id
		};
		const data = await RequestHttp.get(apiList, { params });
		const serviceData: ServiceItemType[] = data.Data.ServiceSummaryList;
		setTableData(serviceData);
		if (serviceName) {
			setSelectedRowKeys([serviceName]);
			setSelectedServiceRowsList(
				serviceData.filter(item => item.ServiceName === serviceName).map(item => ({ ...item, SCStateEnum: 'SELECTED' }))
			);
		} else {
			const defaultSelectedKeys = serviceData
				.filter(item => selectedStates.includes(item.SCStateEnum))
				.map(item => item.ServiceName);
			setSelectedRowKeys(defaultSelectedKeys);
			setSelectedServiceRowsList(
				serviceData.filter(item => selectedStates.includes(item.SCStateEnum)).map(item => ({ ...item, SCStateEnum: 'SELECTED' }))
			);
		}

		setCurrentPageDisabled({
			nextDisabled: true,
			retryDisabled: false,
			prevDisabled: false,
			cancelDisabled: false
		});
	};
	useEffect(() => {
		getList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	useEffect(() => {
		// 该页面没有异步轮询操作，可以取消流程，cancelDisabled直接置为false
		setCurrentPageDisabled({ ...currentPageDisabled, nextDisabled: !selectedRowKeys.length, cancelDisabled: false });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedRowKeys]);
	const rowSelection = {
		selectedRowKeys,
		onChange: (selectedRowKeys: Key[], selectedRows: ServiceItemType[]) => {
			setSelectedRowKeys(selectedRowKeys);
			setSelectedServiceRowsList(
				_.cloneDeep(selectedRows).map(item => {
					item.SCStateEnum = 'SELECTED';
					return item;
				})
			);
		},
		getCheckboxProps: () => ({
			disabled: serviceName ? true : false // Column configuration not to be checked
		}),
		selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE]
	};
	return (
		<>
			<h4>{t('totalItems', { total: tableData.length, selected: selectedServiceRowsList.length })}</h4>
			<Table
				rowSelection={{
					...rowSelection
				}}
				rowKey="ServiceName"
				columns={columns}
				dataSource={tableData}
				pagination={{
					showSizeChanger: true,
					total: tableData.length,
					showTotal: total => t('totalItems', { total, selected: selectedServiceRowsList.length })
				}}
			/>
		</>
	);
});
export default SelectServiceStep;
