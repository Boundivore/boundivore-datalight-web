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
import { forwardRef, useImperativeHandle } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table, Progress, Space, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
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

const DispatchStep: React.FC = forwardRef((props, ref) => {
	const { jobNodeId, selectedRowsList, setSelectedRowsList, stableState } = useStore();
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const apiSpeed = APIConfig.dispatchList;
	const apiProgress = APIConfig.dispatchProgress;
	const columns: ColumnsType<DataType> = [
		{
			title: t('node.node'),
			dataIndex: 'Hostname',
			width: 100,
			render: (text: string) => <a>{text}</a>
		},
		{
			title: t('node.progress'),
			dataIndex: 'FileBytesProgress',
			render: (text, record) => {
				console.log(4444, record);
				return (
					<>
						{text ? (
							<>
								<Space>
									{Number(text?.TotalProgress) !== 100 ? <LoadingOutlined /> : null}
									<Text ellipsis={true} className="w-[150px]">
										{t('node.fileProgress')}
										{`${record?.FileCountProgress.TotalTransferFileCount}/${record?.FileCountProgress.TotalFileCount}`}
									</Text>
									{Number(text?.TotalProgress) !== 100 ? (
										<Text ellipsis={true} className="w-[150px]">
											{t('node.fileName')}
											{record?.CurrentFileProgress.CurrentFilename}
										</Text>
									) : null}
									<Text ellipsis={true} className="w-[100px]">
										{t('node.speed')}
										{record?.CurrentFileProgress.CurrentPrintSpeed}
									</Text>
								</Space>
								<Progress percent={Number(text?.TotalProgress).toFixed(2)} strokeColor={twoColors} />
							</>
						) : (
							<>
								<Space>
									<LoadingOutlined />
									<span>
										{t('node.fileProgress')}
										{0}
									</span>
									<span>
										{t('node.speed')}
										{0}
									</span>
								</Space>
								<Progress percent={0} strokeColor={twoColors} />
							</>
						)}
					</>
				);
			}
		},
		{
			title: t('node.config'),
			dataIndex: 'CpuCores',
			width: 100,
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
		const params = {
			ClusterId: id,
			NodeInfoList: selectedRowsList.map(({ Hostname, NodeId }) => ({ Hostname, NodeId }))
		};
		const data = await RequestHttp.post(apiSpeed, params);
		const progressData = await RequestHttp.get(apiProgress, { params: { NodeJobId: jobNodeId } });
		const {
			Data: { NodeInitDetailList }
		} = data;
		const {
			Data: { NodeJobTransferProgressList }
		} = progressData;

		let mergedData = NodeInitDetailList.map(item1 => {
			let item2 = NodeJobTransferProgressList.filter(item2 => item2.NodeId === item1.NodeId);
			if (item2.length > 0) {
				return { ...item1, ...item2[0] };
			} else {
				return item1;
			}
		});
		return mergedData;
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
export default DispatchStep;
