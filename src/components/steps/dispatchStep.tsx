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
import _ from 'lodash';
import useStore, { usePersistStore } from '@/store/store';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import usePolling from '@/hooks/usePolling';
import useStepLogic from '@/hooks/useStepLogic';
import ItemConfigInfo from '@/components/itemConfigInfo';
import { NodeType, NodeJobTransferProgressVo } from '@/api/interface';

const { Text } = Typography;

const twoColors = { '0%': '#108ee9', '100%': '#87d068' };
const preStepName = 'checkStep'; // 当前步骤页面基于上一步的输入和选择生成
const stepName = 'dispatchStep'; // 当前步骤结束时需要存储步骤数据
const disabledState = ['RUNNING', 'SUSPEND'];
const operation = 'DISPATCH'; // 当前步骤操作，NodeActionTypeEnum

const DispatchStep: React.FC = forwardRef((_props, ref) => {
	const { jobNodeId, setJobNodeId, stableState, setCurrentPageDisabled, currentPageDisabled, isRefresh } = useStore();
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
									{/* {parseFloat(text?.TotalProgress) !== 100 ? <LoadingOutlined /> : null} */}
									<Text ellipsis={true} className="w-[150px]">
										{t('node.fileProgress')}
										{`${record?.FileCountProgress.TotalTransferFileCount}/${record?.FileCountProgress.TotalFileCount}`}
									</Text>
									{parseFloat(text?.TotalProgress) !== 100 ? (
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
								<Progress percent={parseFloat(parseFloat(text?.TotalProgress).toFixed(2))} strokeColor={twoColors} />
							</>
						) : (
							<>
								<Space>
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
		handleOk,
		dispatch
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
		setDispatchState(false);

		const apiDispatch = APIConfig.dispatch;
		const params = {
			ClusterId: id,
			NodeActionTypeEnum: operation,
			NodeInfoList: (webState[preStepName] as NodeType[]).map(({ Hostname, NodeId }: any) => ({ Hostname, NodeId })),
			SshPort: (webState[preStepName] as NodeType[])[0].SshPort
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
			NodeInfoList: (webState[preStepName] as NodeType[]).map(({ Hostname, NodeId }) => ({ Hostname, NodeId }))
		};
		const data = await RequestHttp.post(apiList, params);
		const progressData = await RequestHttp.get(apiProgress, { params: { NodeJobId: jobNodeId } });
		const {
			Data: { ExecStateEnum, NodeInitDetailList }
		} = data;
		const {
			Data: { NodeJobTransferProgressList }
		} = progressData;

		let mergedData = NodeInitDetailList.map((item1: NodeType) => {
			let item2 = NodeJobTransferProgressList.filter((item2: NodeJobTransferProgressVo) => item2.NodeId === item1.NodeId);
			if (item2.length > 0) {
				return { ...item1, ...item2[0] };
			} else {
				return item1;
			}
		});
		const basicDisabled = disabledState.includes(ExecStateEnum);
		setCurrentPageDisabled({
			nextDisabled: basicDisabled,
			retryDisabled: basicDisabled,
			prevDisabled: basicDisabled,
			cancelDisabled: basicDisabled
		});
		// selectedList和NodeInitDetailList取交集，并过滤掉不可用数据，只选中状态为CHECK_OK的进行下一步
		// selectedList为计算了上一步和下一步的选中项，NodeInitDetailList用来获取最新状态
		const intersection = _.intersectionWith(mergedData, selectedList, (obj1: NodeType, obj2) => obj1.Hostname === obj2.Hostname);
		setSelectedRowsList(intersection.filter((row: NodeType) => row.NodeState === 'PUSH_OK'));
		return mergedData;
	};

	useEffect(() => {
		//基于上一步的数据重新执行当前页面步骤
		if (webState[preStepName]) {
			// 判断是否是刷新后的新加载
			if (isRefresh) {
				setDispatchState(true);
			} else {
				dispatch();
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [webState, selectedList, isRefresh]);
	// dispatch之后拉取得dispatchList
	const tableData = usePolling(getList, stableState, 1000, [dispatchState, webState, jobNodeId]);
	const rowSelection = {
		selectedRowKeys: selectedRowsList.map(row => row.NodeId),
		onChange: (_selectedRowKeys: React.Key[], selectedRows: NodeType[]) => {
			setSelectedRowsList(selectedRows);
			setCurrentPageDisabled({ ...currentPageDisabled, nextDisabled: selectedRows.length === 0 });
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
