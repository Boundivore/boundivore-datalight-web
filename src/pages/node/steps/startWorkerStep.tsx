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
import { forwardRef, useImperativeHandle, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table, Badge } from 'antd';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import useStore from '@/store/store';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import usePolling from '@/hooks/usePolling';
import ItemConfigInfo from '@/components/itemConfigInfo';
import { NodeType } from '@/api/interface';

const preStepName = 'PROCEDURE_DISPATCH';
const stepName = 'PROCEDURE_START_WORKER';
const StartWorkerStep: React.FC = forwardRef((_props, ref) => {
	const { selectedRowsList, setSelectedRowsList, stateText, stableState, setCurrentPageDisabled } = useStore();
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const columns: ColumnsType<NodeType> = [
		{
			title: t('node.node'),
			dataIndex: 'Hostname',
			key: 'Hostname',
			render: (text: string) => <a>{text}</a>
		},
		{
			title: t('node.config'),
			dataIndex: 'CpuCores',
			key: 'CpuCores',
			render: (text: string, record) => <ItemConfigInfo text={text} record={record} />
		},
		{
			title: t('node.state'),
			dataIndex: 'NodeState',
			key: 'NodeState',
			render: (text: string) => <Badge status={stateText[text].status} text={t(stateText[text].label)} />
		}
	];

	useImperativeHandle(ref, () => ({
		handleOk
	}));
	const handleOk = async () => {
		const apiAdd = APIConfig.add;
		const params = {
			ClusterId: id,
			NodeActionTypeEnum: 'ADD',
			NodeInfoList: selectedRowsList[stepName].map(({ Hostname, NodeId }) => ({ Hostname, NodeId })),
			SshPort: tableData[0].SshPort
		};
		const jobData = await RequestHttp.post(apiAdd, params);
		return Promise.resolve(jobData);
	};
	const rowSelection = {
		onChange: (_selectedRowKeys: React.Key[], selectedRows: NodeType[]) => {
			setSelectedRowsList(stepName, selectedRows);
		},
		defaultSelectedRowKeys: selectedRowsList[preStepName].map(({ NodeId }) => {
			return NodeId;
		}),
		getCheckboxProps: (record: NodeType) => ({
			disabled: !stableState.includes(record.NodeState) // Column configuration not to be checked
		})
	};
	const getList = async () => {
		const params = {
			ClusterId: id,
			NodeInfoList: selectedRowsList[preStepName].map(({ Hostname, NodeId }) => ({ Hostname, NodeId }))
		};
		const data = await RequestHttp.post(APIConfig.startWorkerList, params);
		const {
			Data: { ExecStateEnum, NodeInitDetailList }
		} = data;
		setCurrentPageDisabled({ next: ExecStateEnum !== 'OK' && ExecStateEnum !== 'NOT_EXIST' });
		return NodeInitDetailList;
	};
	const tableData = usePolling(getList, stableState, 1000);
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
export default StartWorkerStep;
