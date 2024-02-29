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
import useStore, { usePersistStore } from '@/store/store';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import usePolling from '@/hooks/usePolling';
import ItemConfigInfo from '@/components/itemConfigInfo';
import useStepLogic from '@/hooks/useStepLogic';

interface DataType {
	NodeId: React.Key;
	Hostname: string;
	CpuCores: number;
	CpuArch: string;
	DiskTotal: string;
	NodeState: string;
}
type BadgeStatus = 'success' | 'processing' | 'default' | 'error' | 'warning';

const preStepName = 'parseList'; // 当前步骤页面基于上一步的输入和选择生成
const stepName = 'detectStep';
const DetectStep: React.FC = memo(
	forwardRef((_props, ref) => {
		const { stateText, stableState, setCurrentPageDisabled } = useStore();
		const [selectedRowsList, setSelectedRowsList] = useState([]);
		const { useGetSepState } = useStepLogic();
		const {
			userInfo: { userId }
		} = usePersistStore();
		const { t } = useTranslation();
		const [searchParams] = useSearchParams();
		const id = searchParams.get('id');
		const apiSpeed = APIConfig.detectList;
		// let preStepSelectList = [];
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
			selectedRowKeys: selectedRowsList.map(row => row.Hostname),
			onChange: (_selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
				setSelectedRowsList(selectedRows);
			},
			getCheckboxProps: (record: DataType) => ({
				disabled: record.NodeState === 'INACTIVE' // 状态不是ACTIVE不可选
			})
		};
		useImperativeHandle(ref, () => ({
			handleOk
		}));
		const handleOk = async () => {
			// const apiCheck = APIConfig.check;
			// const params = {
			// 	ClusterId: id,
			// 	NodeActionTypeEnum: 'CHECK',
			// 	NodeInfoList: selectedRowsList.map(({ Hostname, NodeId }) => ({ Hostname, NodeId })),
			// 	SshPort: tableData[0].SshPort
			// };
			// const jobData = await RequestHttp.post(apiCheck, params);
			// setSelectedRowsList(selectedRowsList);
			// return Promise.resolve(jobData);
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
		const webState = useGetSepState(preStepName, stepName, setSelectedRowsList);
		const getWebState = async () => {
			const apiDetect = APIConfig.detect;
			const params3 = {
				ClusterId: id,
				NodeActionTypeEnum: 'DETECT',
				NodeInfoList: webState[preStepName].map(({ Hostname, NodeId }) => ({ Hostname, NodeId })),
				SshPort: webState[preStepName][0].SshPort
			};
			await RequestHttp.post(apiDetect, params3);
			return Promise.resolve();
		};

		const getSpeed = async () => {
			const params = {
				ClusterId: id,
				NodeInfoList: selectedRowsList.map(({ Hostname, NodeId }) => ({ Hostname, NodeId }))
			};
			const data = await RequestHttp.post(apiSpeed, params);
			const {
				Data: { ExecStateEnum, NodeInitDetailList }
			} = data;
			setCurrentPageDisabled({
				next: ExecStateEnum === 'RUNNING' || ExecStateEnum === 'SUSPEND'
			});
			// 用不等于INACTIVE作为过滤条件，而不是等于ACTIVE，因为可能从后边流程退回到这一步，状态不是ACTIVE
			setSelectedRowsList(NodeInitDetailList.filter(row => row.NodeState !== 'INACTIVE')); // 更新选中项数据
			return NodeInitDetailList;
		};
		const tableData = usePolling(getSpeed, stableState, 1000);
		useEffect(() => {
			console.log(1111, webState === webState);
			webState[preStepName] && getWebState();
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [webState]);
		useEffect(() => {
			setCurrentPageDisabled({ next: selectedRowsList.length === 0 });
			// getSpeed();
		}, [selectedRowsList, setCurrentPageDisabled]);

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
