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
 * DispatchStep - 第五步
 * @author Tracy.Guo
 */
import { forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table, Progress, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import useStore, { usePersistStore } from '@/store/store';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import usePolling from '@/hooks/usePolling';
import useStepLogic from '@/hooks/useStepLogic';
import ItemConfigInfo from '@/components/itemConfigInfo';
import { NodeType } from '@/api/interface';

const { Text } = Typography;

const twoColors = { '0%': '#108ee9', '100%': '#87d068' };
const preStepName = 'checkStep'; // 当前步骤页面基于上一步的输入和选择生成
const stepName = 'dispatchStep'; // 当前步骤结束时需要存储步骤数据
const DispatchStep: React.FC = forwardRef((_props, ref) => {
	const { jobNodeId, setJobNodeId, stableState, setCurrentPageDisabled } = useStore();
	const [selectedRowsList, setSelectedRowsList] = useState<NodeType[]>([]);
	const [dispatchState, setDispatchState] = useState(false);
	const { useGetSepData } = useStepLogic();
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const {
		userInfo: { userId }
	} = usePersistStore();
	const { webState, selectedList } = useGetSepData(preStepName, stepName); //获取前后步骤操作存储的数据
	const columns: ColumnsType<NodeType> = [
		{
			title: t('node.node'),
			dataIndex: 'Hostname',
			key: 'Hostname',
			width: 100,
			render: (text: string) => <a>{text}</a>
		},
		{
			title: t('node.progress'),
			dataIndex: 'FileBytesProgress',
			key: 'FileBytesProgress',
			width: '60%',
			render: (text, record) => {
				return (
					<>
						{text ? (
							<>
								<Space>
									{/* {Number(text?.TotalProgress) !== 100 ? <LoadingOutlined /> : null} */}
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
									{/* <LoadingOutlined /> */}
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
			key: 'CpuCores',
			render: (text: string, record) => <ItemConfigInfo text={text} record={record} />
		}
	];
	useImperativeHandle(ref, () => ({
		handleOk
	}));
	const handleOk = async () => {
		const api = APIConfig.webStateSave;
		try {
			const values = selectedRowsList;
			const data = await RequestHttp.post(api, {
				ClusterId: id,
				UserId: userId,
				WebKey: stepName,
				WebValue: btoa(JSON.stringify(values))
			});
			return Promise.resolve(data.Code === '00000');
		} catch (error) {
			return Promise.reject(error);
		}
	};

	const dispatch = async () => {
		const apiDispatch = APIConfig.dispatch;
		const params = {
			ClusterId: id,
			NodeActionTypeEnum: 'DISPATCH',
			NodeInfoList: webState[preStepName].map(({ Hostname, NodeId }: any) => ({ Hostname, NodeId })),
			SshPort: webState[preStepName][0].SshPort
		};
		const {
			Code,
			Data: { NodeJobId }
		} = await RequestHttp.post(apiDispatch, params);
		setJobNodeId(NodeJobId);
		setDispatchState(Code === '00000');
	};

	const getList = async () => {
		const apiList = APIConfig.dispatchList;
		const apiProgress = APIConfig.dispatchProgress;
		const params = {
			ClusterId: id,
			NodeInfoList: webState[preStepName].map(({ Hostname, NodeId }) => ({ Hostname, NodeId }))
		};
		const data = await RequestHttp.post(apiList, params);
		const progressData = await RequestHttp.get(apiProgress, { params: { NodeJobId: jobNodeId } });
		const {
			Data: { ExecStateEnum, NodeInitDetailList }
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
		setCurrentPageDisabled({
			next: ExecStateEnum === 'RUNNING' || ExecStateEnum === 'SUSPEND'
		});
		// 用不等于INACTIVE作为过滤条件，而不是等于ACTIVE，因为可能从后边流程退回到这一步，状态不是ACTIVE
		// setSelectedRowsList(NodeInitDetailList.filter((row: NodeType) => row.NodeState !== 'INACTIVE')); // 更新选中项数据
		return mergedData;
	};

	useEffect(() => {
		setCurrentPageDisabled({ next: selectedRowsList.length === 0 });
	}, [selectedRowsList, setCurrentPageDisabled]);
	useEffect(() => {
		//基于上一步的数据重新执行当前页面步骤
		webState[preStepName] && dispatch();
		setSelectedRowsList(selectedList);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [webState, selectedList]);
	// dispatch之后拉取得dispatchList
	const tableData = usePolling(getList, stableState, 1000, [dispatchState, webState]);
	const rowSelection = {
		selectedRowKeys: selectedRowsList.map(row => row.NodeId),
		onChange: (_selectedRowKeys: React.Key[], selectedRows: NodeType[]) => {
			setSelectedRowsList(selectedRows);
		},
		getCheckboxProps: (record: NodeType) => ({
			disabled: !stableState.includes(record.NodeState) // Column configuration not to be checked
		})
	};
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
