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
import { FC, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Modal, List } from 'antd';
import { useTranslation } from 'react-i18next';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import useStore from '@/store/store';
import { NodeJobLogVo } from '@/api/interface';

interface CheckLogModalProps {
	isModalOpen: boolean;
	handleCancel: () => void;
}

const CheckLogModal: FC<CheckLogModalProps> = ({ isModalOpen, handleCancel }) => {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const { jobNodeId } = useStore();
	const [logData, setLogData] = useState<NodeJobLogVo[]>([]);
	// const [openAlert, setOpenAlert] = useState(false);
	// const [errorText, setErrorText] = useState('');

	const getLog = async () => {
		const api = APIConfig.getNodeLog;
		const params = {
			ClusterId: id,
			NodeJobId: jobNodeId
		};
		const data = await RequestHttp.get(api, { params });
		const {
			Data: { NodeJobLogList }
		} = data;
		console.log(NodeJobLogList);
		setLogData(NodeJobLogList);
	};
	useEffect(() => {
		getLog();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Modal title={t('node.log')} open={isModalOpen} onCancel={handleCancel}>
			{/* {openAlert ? <Alert message={errorText} type="error" /> : null} */}
			<List
				itemLayout="horizontal"
				dataSource={logData}
				renderItem={item => (
					<List.Item>
						<List.Item.Meta title={item.LogErrOut} description={item.LogStdOut} />
					</List.Item>
				)}
			/>
		</Modal>
	);
};
export default CheckLogModal;
