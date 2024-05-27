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
 * CheckLogModal - 查看日志弹窗
 * @param {boolean} isModalOpen - 弹窗是否打开
 * @param {function} handleCancel - 弹窗取消的回调函数
 * @author Tracy
 */
import { FC, useEffect, useState, memo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Modal, List, Collapse, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import useStore from '@/store/store';
import useCurrentCluster from '@/hooks/useCurrentCluster';
import { NodeJobLogVo, JobLogVo } from '@/api/interface';

interface CheckLogModalProps {
	isModalOpen: boolean;
	nodeId: string;
	handleCancel: () => void;
	type?: string;
}
interface StepType {
	StepId: string;
	LogErrOut: string;
	LogStdOut: string;
}
interface TaskType {
	TaskId: string;
	steps: StepType[];
}
// 定义 Job 类型的数据结构
interface JobProcessedData {
	StageId: string;
	tasks: TaskType[];
}

// 定义 Node 类型的数据结构
interface NodeProcessedData {
	NodeId: string;
	NodeJobId: string;
	NodeTaskId: string;
	steps: StepType[];
}
type ProcessedDataType = JobProcessedData[] | NodeProcessedData[];

const CheckLogModal: FC<CheckLogModalProps> = memo(({ isModalOpen, nodeId, handleCancel, type = 'nodeJobProgress' }) => {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const { jobNodeId, jobId } = useStore();
	const { selectCluster } = useCurrentCluster();
	// const [setLogData] = useState<NodeJobLogVo[]>([]);
	const [itemsData, setItemsData] = useState<ProcessedDataType>([]);
	// const [openAlert, setOpenAlert] = useState(false);
	// const [errorText, setErrorText] = useState('');

	const getLog = async () => {
		let api: string;
		let params;

		if (type === 'jobProgress') {
			api = APIConfig.getLog;
			params = {
				ClusterId: id || selectCluster,
				JobId: jobId,
				NodeId: nodeId
			};
		} else if (type === 'nodeJobProgress') {
			api = APIConfig.getNodeLog;
			params = {
				ClusterId: id || selectCluster,
				NodeJobId: jobNodeId,
				NodeId: nodeId
			};
		} else {
			throw new Error(`Unknown type: ${type}`);
		}

		const data = await RequestHttp.get(api, { params });
		const {
			Data: { NodeJobLogList, JobLogList }
		} = data;
		// 根据不同类型处理数据
		let processedData: ProcessedDataType = [];
		if (type === 'jobProgress') {
			// 处理 job 类型数据
			processedData = JobLogList.reduce((acc: JobProcessedData[], item: JobLogVo) => {
				const { StageId, TaskId, StepId } = item;
				// 查找是否存在对应的 StageId
				let stageIndex = acc.findIndex(stage => stage.StageId === StageId);
				// 如果不存在，则创建一个新的 Stage
				if (stageIndex === -1) {
					acc.push({
						StageId,
						tasks: [
							{
								TaskId,
								steps: [{ ...item, StepId }]
							}
						]
					});
				} else {
					// 如果存在，则查找是否存在对应的 TaskId
					let taskIndex = acc[stageIndex].tasks.findIndex(task => task.TaskId === TaskId);
					// 如果不存在，则创建一个新的 Task
					if (taskIndex === -1) {
						acc[stageIndex].tasks.push({
							TaskId,
							steps: [{ ...item, StepId }]
						});
					} else {
						// 如果存在，则将当前数据添加到对应的 Task 的 steps 中
						acc[stageIndex].tasks[taskIndex].steps.push({ ...item, StepId });
					}
				}
				return acc;
			}, []);
		} else if (type === 'nodeJobProgress') {
			// 处理 node 类型数据
			processedData = NodeJobLogList.reduce((acc: NodeProcessedData[], curr: NodeJobLogVo) => {
				// 查找是否已有相同的 NodeTaskId
				const existingTaskIndex = acc.findIndex(item => item.NodeTaskId === curr.NodeTaskId);

				if (existingTaskIndex !== -1) {
					// 如果存在相同的 NodeTaskId，则将当前步骤添加到步骤数组中
					acc[existingTaskIndex].steps.push({
						StepId: curr.StepId,
						LogErrOut: curr.LogErrOut,
						LogStdOut: curr.LogStdOut
					});
				} else {
					// 如果不存在相同的 NodeTaskId，则创建一个新的任务项，并初始化步骤数组
					acc.push({
						NodeId: curr.NodeId,
						NodeJobId: curr.NodeJobId,
						NodeTaskId: curr.NodeTaskId,
						steps: [
							{
								StepId: curr.StepId,
								LogErrOut: curr.LogErrOut,
								LogStdOut: curr.LogStdOut
							}
						]
					});
				}

				return acc;
			}, []);
		}

		setItemsData(processedData);
	};
	useEffect(() => {
		(selectCluster || id) && getLog();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectCluster, id]);
	const generateItems =
		type === 'nodeJobProgress'
			? [
					{
						key: '1',
						label: '标准输出',
						children: (itemsData as NodeProcessedData[]).map(item => (
							<Collapse
								key={item.NodeTaskId}
								className="border-0 indent-small"
								// bordered={false}
								items={[
									{
										label: `${t('taskID')}${item.NodeTaskId}`,
										children: item.steps.map((step: StepType) => (
											<Collapse
												key={step.StepId}
												className="border-0 indent-middle"
												items={[
													{
														label: `${t('stepID')}${step.StepId}`,
														children: (
															<List
																className="pl-[36px]"
																itemLayout="horizontal"
																dataSource={[step]}
																renderItem={list => (
																	<List.Item>
																		<List.Item.Meta title={list.LogStdOut} />
																	</List.Item>
																)}
															/>
														)
													}
												]}
											/>
										))
									}
								]}
							/>
						))
					},
					{
						key: '2',
						label: '错误输出',
						children: (itemsData as NodeProcessedData[]).map(item => (
							<Collapse
								key={item.NodeTaskId}
								className="border-0 indent-small"
								items={[
									{
										label: `${t('taskID')}${item.NodeTaskId}`,
										children: item.steps.map((step: StepType) => (
											<Collapse
												key={step.StepId}
												className="border-0 indent-middle"
												items={[
													{
														label: `${t('stepID')}${step.StepId}`,
														children: (
															<List
																className="pl-[36px]"
																itemLayout="horizontal"
																dataSource={[step]}
																renderItem={list => (
																	<List.Item>
																		<List.Item.Meta title={list.LogErrOut} />
																	</List.Item>
																)}
															/>
														)
													}
												]}
											/>
										))
									}
								]}
							/>
						))
					}
			  ]
			: [
					{
						key: '1',
						label: '标准输出',
						children: (itemsData as JobProcessedData[]).map(item => (
							<Collapse
								key={item.StageId}
								className="border-0 indent-small"
								items={[
									{
										label: `${t('stageID')}${item.StageId}`,
										children: item.tasks.map((task: TaskType) => (
											<Collapse
												key={task.TaskId}
												className="border-0 indent-middle"
												items={[
													{
														label: `${t('taskID')}${task.TaskId}`,
														children: task.steps.map(step => (
															<Collapse
																key={step.StepId}
																className="border-0 indent-big"
																items={[
																	{
																		label: `${t('stepID')}${step.StepId}`,
																		children: (
																			<List
																				className="pl-[46px]"
																				itemLayout="horizontal"
																				dataSource={[step]}
																				renderItem={list => (
																					<List.Item>
																						<List.Item.Meta title={list.LogStdOut} />
																					</List.Item>
																				)}
																			/>
																		)
																	}
																]}
															/>
														))
													}
												]}
											/>
										))
									}
								]}
							/>
						))
					},
					{
						key: '2',
						label: '错误输出',
						children: (itemsData as JobProcessedData[]).map(item => (
							<Collapse
								key={item.StageId}
								className="border-0 indent-small"
								items={[
									{
										label: `${t('stageID')}${item.StageId}`,
										children: item.tasks.map((task: TaskType) => (
											<Collapse
												key={task.TaskId}
												className="border-0 indent-middle"
												items={[
													{
														label: `${t('taskID')}${task.TaskId}`,
														children: task.steps.map(step => (
															<Collapse
																key={step.StepId}
																className="border-0 indent-big"
																items={[
																	{
																		label: `${t('stepID')}${step.StepId}`,
																		children: (
																			<List
																				className="pl-[46px]"
																				itemLayout="horizontal"
																				dataSource={[step]}
																				renderItem={list => (
																					<List.Item>
																						<List.Item.Meta title={list.LogErrOut} />
																					</List.Item>
																				)}
																			/>
																		)
																	}
																]}
															/>
														))
													}
												]}
											/>
										))
									}
								]}
							/>
						))
					}
			  ];

	return (
		<Modal
			title={t('node.log')}
			open={isModalOpen}
			onCancel={handleCancel}
			footer={[
				<Button key="cancel" onClick={handleCancel}>
					{t('close')}
				</Button>
			]}
		>
			{/* {openAlert ? <Alert message={errorText} type="error" /> : null} */}

			<Collapse items={generateItems} className="data-light-log max-h-[500px] overflow-auto" />
		</Modal>
	);
});
export default CheckLogModal;
