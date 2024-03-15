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
 * DetectStep - 第三步
 * @author Tracy.Guo
 */
import { forwardRef, useImperativeHandle, useEffect, useState, memo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table, Badge } from 'antd';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import _ from 'lodash';
import useStore from '@/store/store';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import usePolling from '@/hooks/usePolling';
import ItemConfigInfo from '@/components/itemConfigInfo';
import useStepLogic from '@/hooks/useStepLogic';
import { NodeType, BadgeStatus } from '@/api/interface';

const preStepName = 'parseList'; // 当前步骤页面基于上一步的输入和选择生成
const stepName = 'detectStep'; // 当前步骤结束时需要存储步骤数据
const disabledState = ['RUNNING', 'SUSPEND'];

const DetectStep: React.FC = memo(
	forwardRef((_props, ref) => {
		const { stateText, stableState, setCurrentPageDisabled, currentPageDisabled, isRefresh } = useStore();
		const [selectedRowsList, setSelectedRowsList] = useState<NodeType[]>([]);
		const [detectState, setDetectState] = useState(false);
		const { useGetSepData, useSetStepData } = useStepLogic();
		const { webState, selectedList } = useGetSepData(preStepName, stepName); //获取前后步骤操作存储的数据
		const { t } = useTranslation();
		const [searchParams] = useSearchParams();
		const id = searchParams.get('id');
		const columns: ColumnsType<NodeType> = [
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
		useImperativeHandle(ref, () => ({
			handleOk,
			detect
		}));
		const handleOk = useSetStepData(stepName, null, selectedRowsList);
		const detect = async () => {
			setDetectState(false);

			const apiDetect = APIConfig.detect;
			const params = {
				ClusterId: id,
				NodeActionTypeEnum: 'DETECT',
				NodeInfoList: (webState[preStepName] as NodeType[]).map(({ Hostname, NodeId }) => ({ Hostname, NodeId })),
				SshPort: (webState[preStepName] as NodeType[])[0].SshPort
			};
			const data = await RequestHttp.post(apiDetect, params);
			setDetectState(data.Code === '00000');
		};
		const getList = async () => {
			const apiSpeed = APIConfig.detectList;
			const params = {
				ClusterId: id,
				NodeInfoList: (webState[preStepName] as NodeType[]).map(({ Hostname, NodeId }) => ({ Hostname, NodeId }))
			};
			const data = await RequestHttp.post(apiSpeed, params);
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
			// selectedList和NodeInitDetailList取交集，并过滤掉不可用数据
			const intersection = _.intersectionWith(
				NodeInitDetailList,
				selectedList,
				(obj1: NodeType, obj2) => obj1.Hostname === obj2.Hostname
			);
			setSelectedRowsList(intersection.filter((row: NodeType) => row.NodeState === 'ACTIVE'));
			return NodeInitDetailList;
		};
		const tableData = usePolling(getList, stableState, 1000, [detectState, webState]);

		useEffect(() => {
			if (webState[preStepName]) {
				// 判断是否是刷新后的新加载
				if (isRefresh) {
					setDetectState(true);
				} else {
					detect();
				}
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [webState, isRefresh]);

		const rowSelection = {
			selectedRowKeys: selectedRowsList.map(row => row.Hostname),
			onChange: (_selectedRowKeys: React.Key[], selectedRows: NodeType[]) => {
				setSelectedRowsList(selectedRows);
				setCurrentPageDisabled({ ...currentPageDisabled, nextDisabled: selectedRows.length === 0 });
			},
			getCheckboxProps: (record: NodeType) => ({
				disabled: record.NodeState === 'INACTIVE' // 状态不是ACTIVE不可选
			})
		};
		return (
			<Table
				rowSelection={{
					...rowSelection
				}}
				rowKey="Hostname"
				columns={columns}
				dataSource={tableData}
			/>
		);
	})
);
export default DetectStep;
