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
 * @author Tracy
 */
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Base64 from 'crypto-js/enc-base64';
import Utf8 from 'crypto-js/enc-utf8';
import useStore, { usePersistStore } from '@/store/store';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import { NodeType, ParseHostnameType } from '@/api/interface';
import useNavigater from '@/hooks/useNavigater';

interface NodeDataType {
	// 根据实际情况调整这个接口
	[key: string]: NodeType[] | ParseHostnameType | string[];
}
type CallbackType = () => void;

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
			const { Code, Data } = data;
			if (Code === '00000') {
				if (Data !== null) {
					const { JobId, NodeJobId, ProcedureState } = Data;
					setStepCurrent(stepMap[ProcedureState] - step);
					setJobNodeId(NodeJobId);
					setJobId(JobId);
				} else {
					setStepCurrent(0);
				}
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
			if (Code === '00000' && KVMap !== null) {
				KVMap[stepName]
					? setSelectedList(JSON.parse(Utf8.stringify(Base64.parse(KVMap[stepName]))))
					: setSelectedList(JSON.parse(Utf8.stringify(Base64.parse(KVMap[preStepName]))));
				stepName === 'parseStep' && setWebState({ [stepName]: JSON.parse(Utf8.stringify(Base64.parse(KVMap[stepName]))) });
				preStepName && setWebState({ [preStepName]: JSON.parse(Utf8.stringify(Base64.parse(KVMap[preStepName]))) });
			}
		};
		useEffect(() => {
			getWebState(preStepName, stepName);
		}, [preStepName, stepName]);
		return { webState, selectedList };
	};
	// 设置当前步骤数据
	const useSetStepData = (
		stepName: string,
		form: { validateFields: () => any } | null,
		selectedRowsList: NodeType[] | string[] | null
	) => {
		const setStepState = async () => {
			let values;
			if (form !== null) {
				// 如果传入了form，则通过表单验证获取values
				values = await form.validateFields();
			} else if (selectedRowsList !== null) {
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

	const useCancelProcedure = (callback?: CallbackType) => {
		const { navigateToClusterList } = useNavigater();
		const cancelProcedure = async () => {
			const apiRemove = APIConfig.removeProcedure;
			const apiClear = APIConfig.webStateClear;
			const params = {
				ClusterId: id
			};

			// 同时发起两个请求
			const [removeResponse, clearResponse] = await Promise.all([
				RequestHttp.post(apiRemove, params),
				RequestHttp.post(apiClear, params)
			]);

			// 分别从两个响应中提取 Code
			const { Code: removeCode } = removeResponse;
			const { Code: clearCode } = clearResponse;

			// 检查 Code，如果满足条件，则导航到集群列表
			if ((removeCode === '00000' || removeCode === 'D1001') && clearCode === '00000') {
				callback ? callback() : navigateToClusterList();
			}
		};
		return cancelProcedure;
	};

	return { useStepEffect, useGetSepData, useSetStepData, useClearStepData, useCancelProcedure };
};

export default useStepLogic;
