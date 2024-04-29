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
 * viewActiveJobModal - 选择组件时绑定的节点弹窗
 * @param {boolean} isModalOpen - 弹窗是否打开
 * @param {function} handleOk - 弹窗确定的回调函数
 * @param {function} handleCancel - 弹窗取消的回调函数
 * @param {string} type - 对应的api，jobProgress和nodeJobProgress
 * @author Tracy
 */
import { FC, useState, useCallback } from 'react';
import { Modal, Table, Progress, Button, Alert } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import usePolling from '@/hooks/usePolling';
import useStore from '@/store/store';
import CheckLogModal from '@/components/logModal';
import { NodeType, ExecProgressPerNodeVo } from '@/api/interface';

const twoColors = { '0%': '#108ee9', '100%': '#87d068' };
interface ViewActiveJobProps {
	isModalOpen: boolean;
	handleCancel: () => void;
	type: string;
}

const ViewActiveJobModal: FC<ViewActiveJobProps> = ({ isModalOpen, handleCancel, type }) => {
	const { t } = useTranslation();
	const { jobNodeId, jobId, stableState } = useStore();
	const [isLogModalOpen, setIsLogModalOpen] = useState(false);
	const [activeNodeId, setActiveNodeId] = useState('');
	const [openAlert, setOpenAlert] = useState(false);
	const errorText = t('errorJob');
	const columns: ColumnsType<NodeType> = [
		{
			title: t('node.node'),
			dataIndex: 'Hostname',
			width: '20%',
			render: (text: string) => <a>{text}</a>
		},
		{
			title: t('progress'),
			dataIndex: 'ExecProgress',
			render: text => {
				return <Progress percent={parseFloat(parseFloat(text).toFixed(2))} strokeColor={twoColors} />;
			}
		},
		{
			title: t('node.log'),
			dataIndex: 'NodeState',
			key: 'NodeState',
			width: '20%',
			render: (_text, record) => <a onClick={() => viewLog(record.NodeId)}> {t('node.viewLog')}</a>
		}
	];
	const viewLog = (nodeId: string) => {
		setIsLogModalOpen(true);
		setActiveNodeId(nodeId);
	};
	const handleLogModalCancel = useCallback(() => {
		setIsLogModalOpen(false);
	}, []);
	const getList = async () => {
		const apiProgress = APIConfig[type];
		if (type === 'nodeJobProgress') {
			const progressData = await RequestHttp.get(apiProgress, { params: { NodeJobId: jobNodeId } });
			const {
				Data: {
					NodeJobExecProgress: { ExecProgressPerNodeList, JobExecStateEnum }
				}
			} = progressData;
			const updatedArray = ExecProgressPerNodeList.map((obj: ExecProgressPerNodeVo) => ({
				...obj, // 展开当前对象
				JobExecStateEnum // 展开新键值对，这将合并到当前对象中
			}));
			setOpenAlert(JobExecStateEnum === 'ERROR');
			return updatedArray; // 将JobExecStateEnum并入每一条数据，作为轮询终止的条件
		} else if (type === 'jobProgress') {
			const progressData = await RequestHttp.get(apiProgress, { params: { JobId: jobId } });
			const {
				Data: {
					JobExecProgress: { ExecProgressPerNodeList, JobExecStateEnum }
				}
			} = progressData;
			const updatedArray = ExecProgressPerNodeList.map((obj: ExecProgressPerNodeVo) => ({
				...obj, // 展开当前对象
				JobExecStateEnum // 展开新键值对，这将合并到当前对象中
			}));
			setOpenAlert(JobExecStateEnum === 'ERROR');
			return updatedArray; // 将JobExecStateEnum并入每一条数据，作为轮询终止的条件
		}
	};
	const tableData = usePolling(getList, stableState, 1000, [true]);

	return (
		<Modal
			title={type === 'nodeJobProgress' ? t('viewActiveNodeJob') : t('viewActiveJob')}
			open={isModalOpen}
			onCancel={handleCancel}
			footer={[
				<Button key="cancel" onClick={handleCancel}>
					{t('close')}
				</Button>
			]}
		>
			{openAlert ? <Alert message={errorText} type="error" /> : null}
			<Table rowKey="NodeId" dataSource={tableData} columns={columns} />
			{isLogModalOpen ? (
				<CheckLogModal isModalOpen={isLogModalOpen} nodeId={activeNodeId} handleCancel={handleLogModalCancel} type={type} />
			) : null}
		</Modal>
	);
};
export default ViewActiveJobModal;
