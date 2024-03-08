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
// import { useState } from 'react';
import { Table, Progress, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import useStore from '@/store/store';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import usePolling from '@/hooks/usePolling';
import { NodeType } from '@/api/interface';

const { Text } = Typography;

const twoColors = { '0%': '#108ee9', '100%': '#87d068' };
// const preStepName = 'dispachStep'; // 当前步骤页面基于上一步的输入和选择生成
// const stepName = 'deployStep'; // 当前步骤结束时需要存储步骤数据
const DeployStep: React.FC = () => {
	const { stableState, jobId, setCurrentPageDisabled } = useStore();
	// const [selectedRowsList, setSelectedRowsList] = useState<NodeType[]>([]);
	const { t } = useTranslation();
	const columns: ColumnsType<NodeType> = [
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
			render: text => {
				return <Progress percent={parseFloat(parseFloat(text).toFixed(2))} strokeColor={twoColors} />;
			}
		},
		{
			title: t('node.detail'),
			dataIndex: 'ExecProgressStepList',
			render: (text: []) => {
				const runningStep = text.find(step => step.StepExecState === 'RUNNING');
				const errorStep = text.reverse().find(step => step.StepExecState === 'ERROR');
				const okStep = text.reverse().find(step => step.StepExecState === 'OK');
				return runningStep ? (
					<Text className="text-blue-500">{runningStep?.StepName}</Text>
				) : errorStep ? (
					<Text className="text-red-500">{errorStep?.StepName}</Text>
				) : (
					<Text className="text-green-500">{okStep?.StepName}</Text>
				);
			}
		}
	];
	// const rowSelection = {
	// 	onChange: (_selectedRowKeys: React.Key[], _selectedRows: NodeType[]) => {
	// 		console.log(_selectedRows);
	// 		// setSelectedRowsList(selectedRows);
	// 	},
	// 	// defaultSelectedRowKeys: selectedRowsList.map(({ NodeId }) => {
	// 	// 	return NodeId;
	// 	// }),
	// 	getCheckboxProps: (record: NodeType) => ({
	// 		disabled: !stableState.includes(record.NodeState) // Column configuration not to be checked
	// 	})
	// };
	const getList = async () => {
		const api = APIConfig.jobProgress;
		const progressData = await RequestHttp.get(api, { params: { JobId: jobId } });
		const {
			Data: {
				JobExecProgress: { ExecProgressPerNodeList, JobExecStateEnum }
			}
		} = progressData;
		const updatedArray = ExecProgressPerNodeList.map(obj => ({
			...obj, // 展开当前对象
			JobExecStateEnum // 展开新键值对，这将合并到当前对象中
		}));
		setCurrentPageDisabled({
			next: JobExecStateEnum === 'RUNNING' || JobExecStateEnum === 'SUSPEND'
		});
		return updatedArray; // 将JobExecStateEnum并入每一条数据，作为轮询终止的条件
	};

	const tableData = usePolling(getList, stableState, 1000, [true]);
	return (
		<Table
			className="data-light-table" //使用自定义class重定义table行高
			rowKey="NodeId"
			columns={columns}
			dataSource={tableData}
		/>
	);
};
export default DeployStep;
