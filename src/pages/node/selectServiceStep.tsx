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
import { forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table, Badge } from 'antd';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import useStore from '@/store/store';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';

interface DataType {
	NodeId: React.Key;
	Hostname: string;
	CpuCores: number;
	CpuArch: string;
	DiskTotal: string;
	NodeState: string;
}

const SelectServiceStep: React.FC = forwardRef((props, ref) => {
	const { selectedServiceRowsList, setSelectedServiceRowsList, stateText, stableState } = useStore();
	const [tableData, setTableData] = useState([]);
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const apiSpeed = APIConfig.serviceList;
	const columns: ColumnsType<DataType> = [
		{
			title: t('service.serviceName'),
			dataIndex: 'ServiceName',
			render: (text: string) => <a>{text}</a>
		},
		{
			title: t('node.config'),
			dataIndex: 'CpuCores',
			render: (text: string, record) => (
				<a>
					{text}
					{t('node.core')}
					{record.CpuArch}
					{t('node.gb')}
					{record.DiskTotal}
					{t('node.gb')}
				</a>
			)
		},
		{
			title: t('node.state'),
			dataIndex: 'SCStateEnum',
			render: (text: string) => <Badge status={stateText[text].status} text={t(stateText[text].label)} />
		}
	];
	const rowSelection = {
		onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
			setSelectedServiceRowsList(selectedRows.map(item => (item.SCStateEnum = 'SELECTED')));
		},
		defaultSelectedRowKeys: selectedServiceRowsList.map(({ ServiceName }) => {
			return ServiceName;
		}),
		getCheckboxProps: (record: DataType) => ({
			disabled: !stableState.includes(record.SCStateEnum) // Column configuration not to be checked
		})
	};
	useImperativeHandle(ref, () => ({
		handleOk
	}));
	const handleOk = async () => {
		const apiSelect = APIConfig.selectService;
		// let mergedArray = selectedServiceRowsList.concat(tableData); // 先合并两个数组
		// let finalArray = mergedArray.reduce((acc, curr) => {
		// 	// 检查是否已经有一个相同的id存在于结果数组中
		// 	let existingIndex = acc.findIndex(item => item.ServiceName === curr.ServiceName);
		// 	if (existingIndex !== -1) {
		// 		// 如果存在，使用第一个数组中的值
		// 		acc[existingIndex] = Object.assign({}, acc[existingIndex], curr);
		// 	} else {
		// 		// 否则，将当前元素添加到结果数组中
		// 		acc.push(curr);
		// 	}
		// 	return acc;
		// }, []);
		const params = {
			ClusterId: id,
			ServiceList: tableData.map(({ SCStateEnum, ServiceName }) => ({ SCStateEnum, ServiceName }))
		};
		const jobData = await RequestHttp.post(apiSelect, params);
		return Promise.resolve(jobData);
	};

	const getSpeed = async () => {
		const params = {
			ClusterId: id
		};
		const data = await RequestHttp.get(apiSpeed, { params });
		setTableData(data.Data.ServiceSummaryList);
	};
	useEffect(() => {
		getSpeed();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<Table
			rowSelection={{
				...rowSelection
			}}
			rowKey="ServiceName"
			columns={columns}
			dataSource={tableData}
		/>
	);
});
export default SelectServiceStep;
