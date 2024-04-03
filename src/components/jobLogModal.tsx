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
 * JobLogModal - 查询节点异步任务计划生成的进度弹窗
 * @param {boolean} isModalOpen - 弹窗是否打开
 * @param {function} handleOk - 弹窗确定的回调函数
 * @param {function} handleCancel - 弹窗取消的回调函数
 * @author Tracy.Guo
 */
import { FC, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Modal, List, Collapse, Button } from 'antd';
// import type { CollapseProps } from 'antd';
import { useTranslation } from 'react-i18next';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import useStore from '@/store/store';
// import { NodeJobLogVo } from '@/api/interface';

interface CheckLogModalProps {
	isModalOpen: boolean;
	nodeId: string;
	handleCancel: () => void;
}

const JobLogModal: FC<CheckLogModalProps> = ({ isModalOpen, nodeId, handleCancel }) => {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const { jobId } = useStore();
	// const [setLogData] = useState<NodeJobLogVo[]>([]);
	const [itemsData, setItemsData] = useState([]);
	// const [openAlert, setOpenAlert] = useState(false);
	// const [errorText, setErrorText] = useState('');

	const getLog = async () => {
		const api = APIConfig.getLog;
		const params = {
			ClusterId: id,
			JobId: jobId,
			NodeId: nodeId
		};
		const data = await RequestHttp.get(api, { params });
		const {
			Data: { JobLogList }
		} = data;
		const groupedByTaskId = JobLogList.reduce((result, item) => {
			const taskId = item.TaskId;
			if (!result[taskId]) {
				result[taskId] = []; // 初始化新数组，如果还没有的话
			}
			result[taskId].push(item); // 将当前项添加到对应taskId的数组中
			return result;
		}, {});

		// 将分组后的对象转换为数组形式
		const newArray = Object.values(groupedByTaskId);
		console.log(newArray);
		setItemsData(newArray);
		// setLogData(NodeJobLogList);
	};
	useEffect(() => {
		getLog();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	const generateItems = [
		{
			key: '1',
			label: '标准输出',
			children: itemsData.map(item => (
				<Collapse
					items={[
						{
							label: `阶段 ID: ${item[0].StageId}`,
							children: (
								<Collapse
									items={[
										{
											label: `任务 ID: ${item[0].TaskId}`,
											children: (
												<Collapse
													items={[
														{
															label: `步骤 ID: ${item[0].StepId}`,
															children: (
																<List
																	itemLayout="horizontal"
																	dataSource={item}
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
											)
										}
									]}
								/>
							)
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
					items={[
						{
							label: `阶段 ID: ${item[0].StageId}`,
							children: (
								<Collapse
									items={[
										{
											label: `任务id: ${item[0].TaskId}`,
											children: (
												<Collapse
													items={[
														{
															label: `步骤 ID: ${item[0].StepId}`,
															children: (
																<List
																	itemLayout="horizontal"
																	dataSource={item}
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
											)
										}
									]}
								/>
							)
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

			<Collapse items={generateItems} />
		</Modal>
	);
};
export default JobLogModal;
