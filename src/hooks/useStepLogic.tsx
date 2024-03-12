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
 * useStepLogic - 自定义Hook
 * @author Tracy.Guo
 */
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useStore, { usePersistStore } from '@/store/store';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import { NodeType, ParseHostnameType } from '@/api/interface';
interface NodeDataType {
	// 根据实际情况调整这个接口
	[key: string]: NodeType[] | ParseHostnameType;
}

const useStepLogic = (step: number = 0) => {
	const {
		userInfo: { userId }
	} = usePersistStore();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');

	// 定位步骤
	const useStepEffect = () => {
		const { setStepCurrent, setJobNodeId, stepMap, setJobId } = useStore();
		const getProcedure = async () => {
			const apiGetProcedure = APIConfig.getProcedure;
			const data = await RequestHttp.get(apiGetProcedure, { params: { ClusterId: id } });
			const {
				Code,
				Data: { JobId, NodeJobId, ProcedureState }
			} = data;
			if (Code === '00000') {
				data.Data !== null ? setStepCurrent(stepMap[ProcedureState] - step) : setStepCurrent(0);
				setJobNodeId(NodeJobId);
				setJobId(JobId);
			}
		};
		useEffect(() => {
			getProcedure();
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []);
	};
	// 获取当前步骤数据
	const useGetSepData = (preStepName: string = '', stepName: string) => {
		const [webState, setWebState] = useState<NodeDataType>({});
		const [selectedList, setSelectedList] = useState<NodeType[]>([]);
		const getWebState = async (preStepName: string, stepName: string) => {
			const api = APIConfig.webStateGet;
			const params = {
				ClusterId: id,
				UserId: userId
			};
			const data = await RequestHttp.get(api, { params });
			const {
				Data: { KVMap },
				Code
			} = data;
			// 如果当前步骤有数据说明之前操作过，则按当前步骤的数据显示选中节点，如果之前没有，则默认选中上一步选择的节点
			if (Code === '00000') {
				KVMap[stepName]
					? setSelectedList(JSON.parse(atob(KVMap[stepName])))
					: setSelectedList(JSON.parse(atob(KVMap[preStepName])));
			}
			stepName === 'parseStep' && setWebState({ [stepName]: JSON.parse(atob(KVMap[stepName])) });
			preStepName && setWebState({ [preStepName]: JSON.parse(atob(KVMap[preStepName])) });
		};
		useEffect(() => {
			getWebState(preStepName, stepName);
		}, [preStepName, stepName]);
		return { webState, selectedList };
	};
	// 设置当前步骤数据
	const useSetStepData = (stepName: string, form: { validateFields: () => any } | null, selectedRowsList: NodeType[] | null) => {
		const setStepState = async () => {
			let values;
			if (form) {
				// 如果传入了form，则通过表单验证获取values
				values = await form.validateFields();
			} else if (selectedRowsList) {
				// 如果传入了selectedRowsList，则直接使用这个值
				values = selectedRowsList;
			} else {
				// 如果两者都没有，抛出错误或做其他处理
				throw new Error('No values provided for saving state');
			}

			const api = APIConfig.webStateSave;
			try {
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
		return setStepState;
	};
	// 清除当前步骤数据
	const useClearStepData = () => {
		const clearStepState = async () => {
			const api = APIConfig.webStateClear;
			try {
				const data = await RequestHttp.post(api, {
					ClusterId: id
				});
				return Promise.resolve(data.Code === '00000');
			} catch (error) {
				return Promise.reject(error);
			}
		};
		return clearStepState;
	};

	return { useStepEffect, useGetSepData, useSetStepData, useClearStepData };
};

export default useStepLogic;
