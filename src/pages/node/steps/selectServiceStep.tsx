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
 * @author Tracy.Guo
 */
import { forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import _ from 'lodash';
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

const SelectServiceStep: React.FC = forwardRef((_props, ref) => {
	const { selectedServiceRowsList, setSelectedServiceRowsList, stateText } = useStore();
	const [tableData, setTableData] = useState([]);
	const [selectedRowKeys, setSelectedRowKeys] = useState([]);
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
		onChange: (selectedRowKeys: [], selectedRows: DataType[]) => {
			setSelectedRowKeys(selectedRowKeys);
			setSelectedServiceRowsList(
				_.cloneDeep([...selectedRows]).map(item => {
					item.SCStateEnum = 'SELECTED';
					return item;
				})
			);
		},
		selectedRowKeys: selectedRowKeys
	};
	useImperativeHandle(ref, () => ({
		handleOk
	}));
	const handleOk = async () => {
		const apiSelect = APIConfig.selectService;
		// 合并原始数据和本次操作选择的数据, tableData和selectedServiceRowsList位置不能互换
		const combinedArray = [...tableData, ...selectedServiceRowsList];
		// 加工数据，以ServiceName为key
		const groupedByServiceName = combinedArray.reduce((groups, item) => {
			const key = item.ServiceName;
			(groups[key] = groups[key] || []).push(item);
			return groups;
		}, {});
		// 加工数据
		const result = Object.values(groupedByServiceName).map(group => {
			if (group.length === 2) {
				// 从"UNSELECTED"到"SELECTED"， 保留"SELECTED"
				return group[1];
			} else {
				// 从"SELECTED"变为"UNSELECTED"将 SCStateEnum 改为 "UNSELECTED"
				return { ...group[0], SCStateEnum: 'UNSELECTED' };
			}
		});
		const params = {
			ClusterId: id,
			ServiceList: result.map(({ SCStateEnum, ServiceName }) => ({ SCStateEnum, ServiceName }))
		};
		const jobData = await RequestHttp.post(apiSelect, params);
		return Promise.resolve(jobData);
	};

	const getSpeed = async () => {
		const params = {
			ClusterId: id
		};
		const data = await RequestHttp.get(apiSpeed, { params });
		const serviceData = data.Data.ServiceSummaryList;
		setTableData(serviceData);
		const defaultSelectedKeys = serviceData.filter(item => item.SCStateEnum === 'SELECTED').map(item => item.ServiceName);
		setSelectedRowKeys(defaultSelectedKeys);
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
