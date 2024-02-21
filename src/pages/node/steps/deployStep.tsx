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
 * DeployStep - 部署步骤
 * @author Tracy.Guo
 */
import { forwardRef, useImperativeHandle } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table, Progress, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import useStore from '@/store/store';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import usePolling from '@/hooks/usePolling';

const { Text } = Typography;
interface DataType {
	[x: string]: any;
	NodeId: React.Key;
	Hostname: string;
	CpuCores: number;
	CpuArch: string;
	DiskTotal: string;
	NodeState: string;
}
const twoColors = { '0%': '#108ee9', '100%': '#87d068' };

const DeployStep: React.FC = forwardRef((props, ref) => {
	const { selectedRowsList, setSelectedRowsList, stableState, jobId } = useStore();
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const columns: ColumnsType<DataType> = [
		{
			title: t('node.node'),
			dataIndex: 'Hostname',
			width: 100,
			render: (text: string) => <a>{text}</a>
		},
		{
			title: t('node.deployProgress'),
			dataIndex: 'ExecProgress',
			width: 350,
			render: (text, record) => {
				console.log(4444, record);
				return <Progress percent={Number(text).toFixed(2)} strokeColor={twoColors} />;
			}
		},
		{
			title: t('node.detail'),
			dataIndex: 'ExecProgressStepList',
			render: (text: []) => {
				// const runningStep = text.find(step => step.StepExecState === 'RUNNING');
				return <Text>{text.StepName}</Text>;
			}
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
	useImperativeHandle(ref, () => ({
		handleOk
	}));
	const handleOk = async () => {
		const apiStartWorker = APIConfig.startWorker;
		const params = {
			ClusterId: id,
			NodeActionTypeEnum: 'START_WORKER',
			NodeInfoList: selectedRowsList.map(({ Hostname, NodeId }) => ({ Hostname, NodeId })),
			SshPort: 22
		};
		const jobData = await RequestHttp.post(apiStartWorker, params);
		return Promise.resolve(jobData);
	};

	const getSpeed = async () => {
		const api = APIConfig.jobProgress;
		const progressData = await RequestHttp.get(api, { params: { JobId: jobId } });
		const {
			Data: {
				JobExecProgress: { ExecProgressPerNodeList }
			}
		} = progressData;
		return ExecProgressPerNodeList;
	};

	const tableData = usePolling(getSpeed, stableState, 1000);
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
export default DeployStep;
