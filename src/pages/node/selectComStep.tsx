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
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table, Collapse } from 'antd';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
// import type { CollapseProps } from 'antd';
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

const SelectComStep: React.FC = forwardRef((props, ref) => {
	const { selectedRowsList, stableState } = useStore();
	const [tableData, setTableData] = useState([]);
	const [serviceList, setServiceList] = useState([]);
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const columns: ColumnsType<DataType> = [
		{
			title: t('node.node'),
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
		}
		// {
		// 	title: t('node.state'),
		// 	dataIndex: 'SCStateEnum',
		// 	render: (text: string) => <Badge status={stateText[text].status} text={t(stateText[text].label)} />
		// }
	];
	// const items: CollapseProps['items'] = [
	// 	{
	// 		key: '1',
	// 		label: 'This is panel header 1',
	// 		children: <p>{text}</p>
	// 	},
	// 	{
	// 		key: '2',
	// 		label: 'This is panel header 2',
	// 		children: <p>{text}</p>
	// 	},
	// 	{
	// 		key: '3',
	// 		label: 'This is panel header 3',
	// 		children: <p>{text}</p>
	// 	}
	// ];
	const rowSelection = {
		//onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
		// setSelectedRowsList(selectedRows);
		//},
		defaultSelectedRowKeys: selectedRowsList.map(({ NodeId }) => {
			return NodeId;
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
		const params = {
			ClusterId: id,
			ServiceList: selectedRowsList.map(({ SCStateEnum, ServiceName }) => ({ SCStateEnum, ServiceName }))
		};
		const jobData = await RequestHttp.post(apiSelect, params);
		return Promise.resolve(jobData);
	};

	const getList = async () => {
		const apiList = APIConfig.componentList;
		const params = {
			ClusterId: id
		};
		const data = await RequestHttp.get(apiList, { params });
		const componentList = data.Data.ServiceComponentSummaryVo;
		const transformedData = componentList.map(item => {
			return {
				...item.ServiceSummary,
				ComponentSummaryList: item.ComponentSummaryList
			};
		});
		console.log(555, transformedData);
		setServiceList(transformedData);
		// const newArray = selectedRowsList.map(item => {
		// 	const result = { nodeName: item.nodeName };
		// 	componentList.forEach((component, index) => {
		// 		const dynamicPropertyName = `Component${index + 1}`;
		// 		result[dynamicPropertyName] = { ...component };
		// 	});
		// 	return result;
		// });

		setTableData(transformedData);
	};

	useEffect(() => {
		getList();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<>
			<Collapse items={serviceList} defaultActiveKey={['1']} />
			<Table
				rowSelection={{
					...rowSelection
				}}
				rowKey="NodeId"
				columns={columns}
				dataSource={tableData}
			/>
		</>
	);
});
export default SelectComStep;
