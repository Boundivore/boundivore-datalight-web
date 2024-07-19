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
 * @author Tracy
 */
import { forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table, Progress, Typography, Alert, Flex, Space, Badge, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import type { ColumnsType } from 'antd/es/table';
import useStore from '@/store/store';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import usePolling from '@/hooks/usePolling';
import JobPlanModal from '@/components/jobPlanModal';
import LogModal from '@/components/logModal';
import { NodeType, ExecProgressPerNodeVo, ExecProgressStepVo } from '@/api/interface';
import useStepLogic from '@/hooks/useStepLogic';

const { Text } = Typography;

const twoColors = { '0%': '#108ee9', '100%': '#87d068' };
const disabledState = ['RUNNING', 'SUSPEND', 'ERROR'];
const disableCancelState = ['RUNNING', 'OK'];
const operation = 'MIGRATE'; // 当前步骤操作，NodeActionTypeEnum

const MigrateList = forwardRef((_props, ref) => {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const { stableState, jobId, setJobId, setCurrentPageDisabled, stepCurrent, setMigrateStep } = useStore();
	const [openAlert, setOpenAlert] = useState(false);
	const [deployState, setDeployState] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isLogModalOpen, setIsLogModalOpen] = useState(false);
	const [activeNodeId, setActiveNodeId] = useState('');
	const { useStepEffect } = useStepLogic();
	const errorText = t('errorJob');
	const columns: ColumnsType<NodeType> = [
		{
			title: t('node.node'),
			dataIndex: 'Hostname',
			key: 'Hostname',
			width: 100,
			render: (text: string) => <a>{text}</a>
		},
		{
			title: t('node.deployProgress'),
			dataIndex: 'ExecProgress',
			key: 'ExecProgress',
			width: 350,
			render: text => {
				return (
					<>
						{parseFloat(text) === 0 ? t('waiting') : null}
						<Progress percent={parseFloat(parseFloat(text).toFixed(2))} strokeColor={twoColors} />
					</>
				);
			}
		},
		{
			title: t('node.detail'),
			dataIndex: 'ExecProgressStepList',
			key: 'ExecProgressStepList',
			render: (text: ExecProgressStepVo[]) => {
				const reversedCopy = [...text].reverse();
				const runningStep = text.find(step => step.StepExecState === 'RUNNING');
				const errorStep = reversedCopy.find(step => step.StepExecState === 'ERROR');
				const okStep = reversedCopy.find(step => step.StepExecState === 'OK');
				const suspendStep = text.find(step => step.StepExecState === 'SUSPEND');
				return runningStep ? (
					<Text className="text-blue-500">{runningStep?.StepName}</Text>
				) : errorStep ? (
					<Text className="text-red-500">{errorStep?.StepName}</Text>
				) : okStep ? (
					<Text className="text-green-500">{okStep?.StepName}</Text>
				) : suspendStep ? (
					<Text className="text-black-500">{suspendStep?.StepName}</Text>
				) : (
					<Text className="text-black-500">{text[text.length - 1]?.StepName}</Text>
				);
			}
		},
		{
			title: t('node.log'),
			dataIndex: 'NodeState',
			key: 'NodeState',
			render: (_text, record) => <a onClick={() => viewLog(record.NodeId)}> {t('node.viewLog')}</a>
		}
	];

	useImperativeHandle(ref, () => ({
		deploy
	}));
	const deploy = async () => {
		setDeployState(false);
		setIsModalOpen(true);
		const api = APIConfig.migrate;
		// const serviceNameList = webState[preStepName];
		const params = {
			ActionTypeEnum: operation,
			ClusterId: id,
			IsOneByOne: false,
			ServiceNameList: ['HDFS']
		};
		try {
			const {
				Code,
				Data: { JobId }
			} = await RequestHttp.post(api, params);
			setJobId(JobId);
			setDeployState(Code === '00000');
		} catch (error) {
			console.error('请求失败:', error);
		} finally {
			setIsModalOpen(false); // 在请求完成后关闭模态框，无论成功还是失败
		}
	};
	const viewLog = (nodeId: string) => {
		setIsLogModalOpen(true);
		setActiveNodeId(nodeId);
	};
	const handleLogModalCancel = () => {
		setIsLogModalOpen(false);
	};

	const getList = async () => {
		if (stepCurrent === 11) {
			const api = APIConfig.jobProgress;
			const progressData = await RequestHttp.get(api, { params: { JobId: jobId } });
			const {
				Data: {
					JobExecProgress: { ExecProgressPerNodeList, JobExecStateEnum }
				}
			} = progressData;
			const updatedArray = ExecProgressPerNodeList.map((obj: ExecProgressPerNodeVo) => ({
				...obj,
				JobExecStateEnum
			}));
			const basicDisabled = disabledState.includes(JobExecStateEnum);
			const disableNext = basicDisabled;
			const disableRetry = JobExecStateEnum !== 'ERROR';
			const disablePrev = JobExecStateEnum !== 'ERROR';
			const disableCancel = disableCancelState.includes(JobExecStateEnum);
			setCurrentPageDisabled({
				nextDisabled: disableNext,
				retryDisabled: disableRetry,
				prevDisabled: disablePrev,
				cancelDisabled: disableCancel
			});
			setOpenAlert(JobExecStateEnum === 'ERROR');
			return updatedArray; // 将JobExecStateEnum并入每一条数据，作为轮询终止的条件
		}
	};
	const handleOk = () => {
		setMigrateStep(['5']);
	};

	const tableData = usePolling(getList, stableState, 1000, [deployState]);
	useEffect(() => {
		//deploy(); //当前有未完成的迁移部署进程则执行
	}, []);
	//获取进度，定位到当前步骤
	useStepEffect();

	return (
		<>
			{openAlert ? <Alert message={errorText} type="error" /> : null}
			<Flex justify="flex-end">
				<Space>
					<Badge key="blue" color="blue" text={t('process')} />
					<Badge key="green" color="green" text={t('done')} />
					<Badge key="black" color="black" text={t('wait')} />
					<Badge key="red" color="red" text={t('fail')} />
				</Space>
			</Flex>
			<Table
				className="data-light-table" //使用自定义class重定义table行高
				rowKey="NodeId"
				columns={columns}
				dataSource={tableData}
			/>
			<Space className="mt-[20px] flex justify-center">
				<Button type="primary" onClick={handleOk}>
					下一步
				</Button>
			</Space>
			{isModalOpen ? <JobPlanModal isModalOpen={isModalOpen} /> : null}
			{isLogModalOpen ? (
				<LogModal isModalOpen={isLogModalOpen} nodeId={activeNodeId} handleCancel={handleLogModalCancel} type="jobProgress" />
			) : null}
		</>
	);
});
export default MigrateList;
