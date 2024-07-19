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
import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { message, Modal } from 'antd';
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
import useStore from '@/store/store';
import { useTranslation } from 'react-i18next';

const { confirm, info } = Modal;

const useComponentOperations = serviceName => {
	const { t } = useTranslation();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id') || '';
	const { setJobId } = useStore();
	const [isActiveJobModalOpen, setIsActiveJobModalOpen] = useState(false);
	const [handleButton, setHandleButton] = useState(false);
	const [messageApi, contextHolder] = message.useMessage();
	const viewActiveJob = useCallback(
		async (callback = () => info({ title: t('noActiveJob') })) => {
			const apiList = APIConfig.getActiveJobId;
			const data = await RequestHttp.get(apiList);
			const {
				Data: { ClusterId, JobId }
			} = data;
			setJobId(JobId);
			id === ClusterId ? setIsActiveJobModalOpen(true) : callback();
		},
		[id, setJobId, t]
	);

	const handleModalOk = () => {
		setIsActiveJobModalOpen(false);
	};

	const removeComponent = useCallback(
		componentList => {
			const idList = componentList.map(component => ({
				ComponentId: component.ComponentId
			}));
			confirm({
				title: t('remove'),
				content: t('operationConfirm', { operation: t('remove'), number: componentList.length }),
				okText: t('confirm'),
				cancelText: t('cancel'),
				onOk: async () => {
					const api = APIConfig.removeComponent;
					const params = {
						ClusterId: id,
						ComponentIdList: idList,
						ServiceName: serviceName
					};
					const data = await RequestHttp.post(api, params);
					const { Code } = data;
					if (Code === '00000') {
						messageApi.success(t('messageSuccess'));
						setHandleButton(prev => !prev);
					}
				}
			});
		},
		[serviceName, messageApi, id, t]
	);

	const operateComponent = useCallback(
		(operation, componentList, isOneByOne = false) => {
			const jobDetailComponentList = componentList.map(component => {
				const jobDetailNodeList = [
					{
						Hostname: component.Hostname,
						NodeId: component.NodeId,
						NodeIp: component.NodeIp
					}
				];

				return {
					ComponentName: component.ComponentName,
					JobDetailNodeList: jobDetailNodeList
				};
			});
			confirm({
				title: t(operation.toLowerCase()),
				content: t('operationConfirm', { operation: t(operation.toLowerCase()), number: componentList.length }),
				okText: t('confirm'),
				cancelText: t('cancel'),
				onOk: async () => {
					const api = APIConfig.operateService;
					const params = {
						ActionTypeEnum: operation,
						ClusterId: id,
						IsOneByOne: isOneByOne,
						JobDetailServiceList: [
							{
								JobDetailComponentList: jobDetailComponentList,
								ServiceName: serviceName
							}
						]
					};
					const data = await RequestHttp.post(api, params);
					if (data.Code === '00000') {
						messageApi.success(t('messageSuccess'));
						viewActiveJob();
						setHandleButton(prev => !prev);
					}
				}
			});
		},
		[id, serviceName, messageApi, t, viewActiveJob]
	);

	return {
		removeComponent,
		operateComponent,
		viewActiveJob,
		isActiveJobModalOpen,
		handleModalOk,
		contextHolder,
		handleButton
	};
};

export default useComponentOperations;
