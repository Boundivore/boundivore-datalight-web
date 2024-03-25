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
 * @author Tracy.Guo
 */
import { FC } from 'react';
import { Modal, Progress } from 'antd';
import { useTranslation } from 'react-i18next';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import usePolling from '@/hooks/usePolling';
import useStore from '@/store/store';

interface JobPlanModalProps {
	isModalOpen: boolean;
	handleOk: () => void;
	handleCancel: () => void;
	type?: string;
}
const twoColors = { '0%': '#108ee9', '100%': '#87d068' };

const JobPlanModal: FC<JobPlanModalProps> = ({ isModalOpen, handleOk, handleCancel, type = 'nodeJobPlan' }) => {
	const { t } = useTranslation();
	// const [openAlert, setOpenAlert] = useState(false);
	// const [errorText, setErrorText] = useState('');
	const { stableState } = useStore();

	const getJobPlan = async () => {
		const api = APIConfig[type];
		const data = await RequestHttp.get(api);
		const {
			Data: { PlanProgress }
		} = data;
		console.log(handleOk);
		// PlanProgress === '100' && handleOk();
		return [{ PlanProgress, SCStateEnum: PlanProgress === '100' ? 'OK' : 'processing' }];
	};
	const progressData = usePolling(getJobPlan, stableState, 1000, [true]);
	console.log('progressData', progressData);
	// useEffect(() => {
	// 	getJobPlan();
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, []);
	// useEffect(() => {
	// 	if (!initialLoad && !openAlert) {
	// 		const reformatRows = selectedNodeList.map(row => {
	// 			row.SCStateEnum = 'SELECTED';
	// 			return row;
	// 		});
	// 		// 提取defaultNodeList中存在，reformatRows中不存在的条目
	// 		// 这些条目就是从‘已选’状态变为‘未选’状态的数据
	// 		const result = defaultNodeList
	// 			.filter(itemA => {
	// 				return !reformatRows.some(itemB => itemB.NodeId === itemA.NodeId);
	// 			})
	// 			.map(item => {
	// 				return { ...item, SCStateEnum: 'UNSELECTED' };
	// 			});
	// 		const mergedResult = [...result, ...reformatRows];
	// 		handleOk(mergedResult);
	// 	}
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [initialLoad, openAlert]);

	return (
		<Modal title={t('selectNode')} open={isModalOpen} onCancel={handleCancel}>
			{/* {openAlert ? <Alert message={errorText} type="error" /> : null} */}
			<Progress percent={parseFloat(parseFloat(progressData[0]?.PlanProgress).toFixed(2))} strokeColor={twoColors} />
		</Modal>
	);
};
export default JobPlanModal;
