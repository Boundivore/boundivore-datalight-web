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
 * JobPlanModal - 查询节点异步任务计划生成的进度弹窗
 * @param {boolean} isModalOpen - 弹窗是否打开
 * @param {function} handleOk - 弹窗确定的回调函数
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

interface CheckLogModalProps {
	isModalOpen: boolean;
	nodeId: string;
	handleCancel: () => void;
	type?: string;
}

const CheckLogModal: FC<CheckLogModalProps> = memo(({ isModalOpen, nodeId, handleCancel, type = 'nodeJobProgress' }) => {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const { jobNodeId, jobId } = useStore();
	const { selectCluster } = useCurrentCluster();
	// const [setLogData] = useState<NodeJobLogVo[]>([]);
	const [itemsData, setItemsData] = useState([]);
	// const [openAlert, setOpenAlert] = useState(false);
	// const [errorText, setErrorText] = useState('');

	const getLog = async () => {
		let api;
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
		}

		const data = await RequestHttp.get(api, { params });
		const {
			Data: { NodeJobLogList, JobLogList }
		} = data;
		// 根据不同类型处理数据
		let processedData;
		if (type === 'jobProgress') {
			// 处理 job 类型数据
			processedData = JobLogList.reduce((acc, item) => {
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
								steps: [{ StepId, ...item }]
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
							steps: [{ StepId, ...item }]
						});
					} else {
						// 如果存在，则将当前数据添加到对应的 Task 的 steps 中
						acc[stageIndex].tasks[taskIndex].steps.push({ StepId, ...item });
					}
				}
				return acc;
			}, []);
		} else if (type === 'nodeJobProgress') {
			// 处理 node 类型数据
			processedData = NodeJobLogList.reduce((acc, curr) => {
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
						children: itemsData.map(item => (
							<Collapse
								className="border-0 indent-small"
								// bordered={false}
								items={[
									{
										label: `任务 ID: ${item.NodeTaskId}`,
										children: item.steps.map(step => (
											<Collapse
												className="border-0 indent-middle"
												items={[
													{
														label: `步骤 ID: ${step.StepId}`,
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
						children: itemsData.map(item => (
							<Collapse
								className="border-0 indent-small"
								items={[
									{
										label: `任务id: ${item.NodeTaskId}`,
										children: item.steps.map(step => (
											<Collapse
												className="border-0 indent-middle"
												items={[
													{
														label: `步骤 ID: ${step.StepId}`,
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
						children: itemsData.map(item => (
							<Collapse
								className="border-0 indent-small"
								items={[
									{
										label: `阶段 ID: ${item.StageId}`,
										children: item.tasks.map(task => (
											<Collapse
												className="border-0 indent-middle"
												items={[
													{
														label: `任务 ID: ${task.TaskId}`,
														children: task.steps.map(step => (
															<Collapse
																className="border-0 indent-big"
																items={[
																	{
																		label: `步骤 ID: ${step.StepId}`,
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
						children: itemsData.map(item => (
							<Collapse
								className="border-0 indent-small"
								items={[
									{
										label: `阶段 ID: ${item.StageId}`,
										children: item.tasks.map(task => (
											<Collapse
												className="border-0 indent-middle"
												items={[
													{
														label: `任务id: ${task.TaskId}`,
														children: task.steps.map(step => (
															<Collapse
																className="border-0 indent-big"
																items={[
																	{
																		label: `步骤 ID: ${step.StepId}`,
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
