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
 * ParseList - 解析出的节点主机名列表
 * @author Tracy.Guo
 */
import React, { useImperativeHandle, forwardRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Table, Badge } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import useStore from '@/store/store';
import usePolling from '@/hooks/usePolling';

interface DataType {
	NodeId: React.Key;
	Hostname: string;
	CpuCores: number;
	CpuArch: string;
	DiskTotal: string;
	NodeState: string;
}
type BadgeStatus = 'success' | 'processing' | 'default' | 'error' | 'warning';

const ParseList: React.FC = forwardRef((_props, ref) => {
	const { t } = useTranslation();
	const { setSelectedRowsList, selectedRowsList, stateText, stableState, setCurrentPageDisabled } = useStore();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const apiState = APIConfig.nodeInitList;
	const columns: ColumnsType<DataType> = [
		{
			title: t('node.node'),
			dataIndex: 'Hostname',
			render: (text: string) => <a>{text}</a>
		},
		{
			title: t('node.config'),
			dataIndex: 'CpuCores',
			render: (text: string, record) => (
				<a>
					{text}
					{t('node.core')}
					{(record?.Ram / 1024).toFixed(2)}
					{t('node.gb')}
					{(record?.DiskTotal / 1024).toFixed(2)}
					{t('node.gb')}
					{record?.CpuArch}
				</a>
			)
		},
		{
			title: t('node.state'),
			dataIndex: 'NodeState',
			render: (text: string) => <Badge status={stateText[text].status as BadgeStatus} text={t(stateText[text].label)} />
		}
	];
	const rowSelection = {
		onChange: (_selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
			setSelectedRowsList(selectedRows);
		},
		defaultSelectedRowKeys: selectedRowsList.map(({ NodeId }) => {
			return NodeId;
		}),
		getCheckboxProps: (record: DataType) => ({
			disabled: !stableState.includes(record.NodeState) // Column configuration not to be checked
		})
	};

	const getState = async () => {
		const data = await RequestHttp.get(apiState, { params: { ClusterId: id } });
		const {
			Data: { ExecStateEnum, NodeInitDetailList }
		} = data;
		setCurrentPageDisabled({ next: ExecStateEnum !== 'NOT_EXIST' });
		return NodeInitDetailList;
	};
	const tableData: DataType[] = usePolling(getState, stableState, 1000);

	useImperativeHandle(ref, () => ({
		handleOk
	}));
	const handleOk = async () => {
		const apiDetect = APIConfig.detect;
		const params = {
			ClusterId: id,
			NodeActionTypeEnum: 'DETECT',
			NodeInfoList: selectedRowsList.map(({ Hostname, NodeId }) => ({ Hostname, NodeId })),
			SshPort: 22
		};
		const jobData = await RequestHttp.post(apiDetect, params);
		return Promise.resolve(jobData);
	};
	useEffect(() => {
		setCurrentPageDisabled({ next: true });
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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

export default ParseList;
