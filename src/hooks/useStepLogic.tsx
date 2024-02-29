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

interface MyProps {
	step?: number;
}
const useStepLogic = <T extends MyProps>(step: T) => {
	const { setStepCurrent, setJobNodeId, stepMap, setJobId } = useStore();
	const {
		userInfo: { userId }
	} = usePersistStore();
	const [searchParams] = useSearchParams();
	const id = searchParams.get('id');
	const getProcedure = async (id: string | number) => {
		const apiGetProcedure = APIConfig.getProcedure;
		const data = await RequestHttp.get(apiGetProcedure, { params: { ClusterId: id } });
		const {
			Code,
			Data: { JobId, NodeJobId, ProcedureState }
		} = data;
		if (Code === '00000') {
			setStepCurrent(step ? stepMap[ProcedureState] - step : stepMap[ProcedureState]);
			setJobNodeId(NodeJobId);
			setJobId(JobId);
		} else if (Code === 'D1001') {
			setStepCurrent(0);
		}
	};

	// 定位步骤
	const useStepEffect = (id: string | number) => {
		useEffect(() => {
			getProcedure(id);
		}, [id]);
	};
	// 获取当前步骤数据
	const useGetSepState = (preStepName, stepName, setSelectedRowsList) => {
		const [webState, setWebState] = useState({});
		const getWebState = async (preStepName, stepName, setSelectedRowsList) => {
			const api = APIConfig.webStateGet;
			const params = {
				ClusterId: id,
				UserId: userId,
				WebKey: preStepName
			};
			const data = await RequestHttp.get(api, { params });
			const {
				Data: { KVMap }
			} = data;
			// TODO 接口没问题之后，合并
			const params2 = {
				ClusterId: id,
				UserId: userId,
				WebKey: stepName
			};
			const data2 = await RequestHttp.get(api, { params: params2 });
			// 如果当前步骤有数据说明之前操作过，则按当前步骤的数据显示选中节点，如果之前没有，则默认选中上一步选择的节点
			if (data2.Code === '00000') {
				setSelectedRowsList(JSON.parse(atob(data2.Data.KVMap[stepName])));
			} else {
				setSelectedRowsList(JSON.parse(atob(KVMap[preStepName])));
			}
			setWebState({ [preStepName]: JSON.parse(atob(KVMap[preStepName])) });
		};
		useEffect(() => {
			getWebState(preStepName, stepName, setSelectedRowsList);
		}, [preStepName, stepName, setSelectedRowsList]);
		return { ...webState };
	};

	return { useStepEffect, useGetSepState };
};

export default useStepLogic;
