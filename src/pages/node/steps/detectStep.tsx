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
import useStore, { useComponentAndNodeStore } from '@/store/store';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import usePolling from '@/hooks/usePolling';
import ItemConfigInfo from '@/components/itemConfigInfo';

interface DataType {
	NodeId: React.Key;
	Hostname: string;
	CpuCores: number;
	CpuArch: string;
	DiskTotal: string;
	NodeState: string;
}
type BadgeStatus = 'success' | 'processing' | 'default' | 'error' | 'warning';
// const preStepName = 'PROCEDURE_PARSE_HOSTNAME';
const stepName = 'PROCEDURE_DETECT';
const nextStepName = 'PROCEDURE_CHECK';
const DetectStep: React.FC = forwardRef((_props, ref) => {
	const { stateText, stableState, setCurrentPageDisabled } = useStore();
	const { selectedRowsList, setSelectedRowsList } = useComponentAndNodeStore();
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	// 当前页面选择条目，区别进程中的selectedRowsList, currentSelectedRowsList用于当前页面的逻辑
	const [currentSelectedRowsList, setCurrentSelectedRowsList] = useState(selectedRowsList[stepName]);
	const apiSpeed = APIConfig.detectList;
	const columns: ColumnsType<DataType> = [
		{
			title: t('node.node'),
			dataIndex: 'Hostname',
			render: (text: string) => <a>{text}</a>
		},
		{
			title: t('node.config'),
			dataIndex: 'CpuCores',
			render: (text: string, record) => <ItemConfigInfo text={text} record={record} />
		},
		{
			title: t('node.state'),
			dataIndex: 'NodeState',
			render: (text: string) => <Badge status={stateText[text].status as BadgeStatus} text={t(stateText[text].label)} />
		}
	];
	const rowSelection = {
		selectedRowKeys: currentSelectedRowsList.map(row => row.NodeId),
		onChange: (_selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
			setCurrentSelectedRowsList(selectedRows);
		},
		getCheckboxProps: (record: DataType) => ({
			disabled: record.NodeState === 'INACTIVE' // 状态不是ACTIVE不可选
		})
	};
	useImperativeHandle(ref, () => ({
		handleOk
	}));
	const handleOk = async () => {
		const apiCheck = APIConfig.check;
		const params = {
			ClusterId: id,
			NodeActionTypeEnum: 'CHECK',
			NodeInfoList: currentSelectedRowsList.map(({ Hostname, NodeId }) => ({ Hostname, NodeId })),
			SshPort: tableData[0].SshPort
		};
		const jobData = await RequestHttp.post(apiCheck, params);
		setSelectedRowsList(nextStepName, currentSelectedRowsList);
		return Promise.resolve(jobData);
	};

	const getSpeed = async () => {
		const params = {
			ClusterId: id,
			NodeInfoList: currentSelectedRowsList.map(({ Hostname, NodeId }) => ({ Hostname, NodeId }))
		};
		const data = await RequestHttp.post(apiSpeed, params);
		const {
			Data: { ExecStateEnum, NodeInitDetailList }
		} = data;
		setCurrentPageDisabled({
			next: ExecStateEnum === 'RUNNING' || ExecStateEnum === 'SUSPEND' || currentSelectedRowsList.length === 0
		});
		// 用不等于INACTIVE作为过滤条件，而不是等于ACTIVE，因为可能从后边流程退回到这一步，状态不是ACTIVE
		setCurrentSelectedRowsList(NodeInitDetailList.filter(row => row.NodeState !== 'INACTIVE')); // 更新选中项数据
		return NodeInitDetailList;
	};
	const tableData = usePolling(getSpeed, stableState, 1000);
	useEffect(() => {
		setCurrentPageDisabled({ next: currentSelectedRowsList.length === 0 });
	}, [currentSelectedRowsList, setCurrentPageDisabled]);
	return (
		<Table
			rowSelection={{
				...rowSelection
			}}
			rowKey="NodeId"
			columns={columns}
			dataSource={tableData}
		/>
	);
});
export default DetectStep;
