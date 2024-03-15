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
 * StartWorkerStep - 第六步
 * @author Tracy.Guo
 */
import { forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table, Badge } from 'antd';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import _ from 'lodash';
import useStore from '@/store/store';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import usePolling from '@/hooks/usePolling';
import useStepLogic from '@/hooks/useStepLogic';
import ItemConfigInfo from '@/components/itemConfigInfo';
import { NodeType, BadgeStatus } from '@/api/interface';

const preStepName = 'dispatchStep'; // 当前步骤页面基于上一步的输入和选择生成
const stepName = 'startWorkerStep'; // 当前步骤结束时需要存储步骤数据
const disabledState = ['RUNNING', 'SUSPEND'];
const operation = 'START_WORKER'; // 当前步骤操作，NodeActionTypeEnum
const nextOperation = 'ADD'; // 下一步操作，NodeActionTypeEnum

const StartWorkerStep: React.FC = forwardRef((_props, ref) => {
	const { stateText, stableState, setCurrentPageDisabled, currentPageDisabled, isRefresh } = useStore();
	const [selectedRowsList, setSelectedRowsList] = useState<NodeType[]>([]);
	const [startWorkerState, setStartWorkerState] = useState(false);
	const { useGetSepData } = useStepLogic();
	const { webState, selectedList } = useGetSepData(preStepName, stepName); //获取前后步骤操作存储的数据
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
			render: (text: string) => <Badge status={stateText[text].status as BadgeStatus} text={t(stateText[text].label)} />
		}
	];

	useImperativeHandle(ref, () => ({
		handleOk,
		startWorker
	}));
	const handleOk = async () => {
		const apiAdd = APIConfig.add;
		const params = {
			ClusterId: id,
			NodeActionTypeEnum: nextOperation,
			NodeInfoList: selectedRowsList.map(({ Hostname, NodeId }) => ({ Hostname, NodeId })),
			SshPort: selectedRowsList[0].SshPort
		};
		const jobData = await RequestHttp.post(apiAdd, params);
		return Promise.resolve(jobData);
	};
	const startWorker = async () => {
		setStartWorkerState(false);

		const apiStartWorker = APIConfig.startWorker;
		const params = {
			ClusterId: id,
			NodeActionTypeEnum: operation,
			NodeInfoList: (webState[preStepName] as NodeType[]).map(({ Hostname, NodeId }) => ({ Hostname, NodeId })),
			SshPort: (webState[preStepName] as NodeType[])[0].SshPort
		};
		const { Code } = await RequestHttp.post(apiStartWorker, params);
		setStartWorkerState(Code === '00000');
	};
	const getList = async () => {
		const params = {
			ClusterId: id,
			NodeInfoList: (webState[preStepName] as NodeType[]).map(({ Hostname, NodeId }) => ({ Hostname, NodeId }))
		};
		const data = await RequestHttp.post(APIConfig.startWorkerList, params);
		const {
			Data: { ExecStateEnum, NodeInitDetailList }
		} = data;
		const basicDisabled = disabledState.includes(ExecStateEnum);
		setCurrentPageDisabled({
			nextDisabled: basicDisabled,
			retryDisabled: basicDisabled,
			prevDisabled: basicDisabled,
			cancelDisabled: basicDisabled
		});
		// selectedList和NodeInitDetailList取交集，并过滤掉不可用数据，只选中状态为CHECK_OK的进行下一步
		// selectedList为计算了上一步和下一步的选中项，NodeInitDetailList用来获取最新状态
		const intersection = _.intersectionWith(
			NodeInitDetailList,
			selectedList,
			(obj1: NodeType, obj2) => obj1.Hostname === obj2.Hostname
		);
		setSelectedRowsList(intersection.filter((row: NodeType) => row.NodeState === 'START_WORKER_OK'));
		return NodeInitDetailList;
	};

	useEffect(() => {
		//基于上一步的数据重新执行当前页面步骤
		if (webState[preStepName]) {
			// 判断是否是刷新后的新加载
			if (isRefresh) {
				setStartWorkerState(true);
			} else {
				startWorker();
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [webState, isRefresh]);
	// dispatch之后拉取得dispatchList
	const tableData = usePolling(getList, stableState, 1000, [startWorkerState, webState]);
	const rowSelection = {
		selectedRowKeys: selectedRowsList.map(row => row.NodeId),
		onChange: (_selectedRowKeys: React.Key[], selectedRows: NodeType[]) => {
			setSelectedRowsList(selectedRows);
			setCurrentPageDisabled({ ...currentPageDisabled, nextDisabled: selectedRows.length === 0 });
		},
		getCheckboxProps: (record: NodeType) => ({
			disabled: !stableState.includes(record.NodeState)
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
export default StartWorkerStep;
