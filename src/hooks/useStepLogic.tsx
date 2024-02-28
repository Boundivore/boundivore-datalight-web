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
import { useEffect } from 'react';
import useStore, { useComponentAndNodeStore } from '@/store/store';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';

interface MyProps {
	step?: number;
}
const useStepLogic = <T extends MyProps>(step: T) => {
	const { setStepCurrent, setJobNodeId, stepMap, setJobId } = useStore();
	const { setSelectedRowsList } = useComponentAndNodeStore();
	const getProcedure = async (id: string | number) => {
		const apiGetProcedure = APIConfig.getProcedure;
		const data = await RequestHttp.get(apiGetProcedure, { params: { ClusterId: id } });
		const {
			Code,
			Data: { JobId, NodeJobId, ProcedureState, NodeInfoList }
		} = data;
		if (Code === '00000') {
			setStepCurrent(step ? stepMap[ProcedureState] - step : stepMap[ProcedureState]);
			setJobNodeId(NodeJobId);
			setJobId(JobId);
			setSelectedRowsList(ProcedureState, NodeInfoList);
		} else if (Code === 'D1001') {
			setStepCurrent(0);
		}
	};
	const useStepEffect = (id: string | number) => {
		useEffect(() => {
			getProcedure(id);
		}, [id]);
	};

	return { useStepEffect };
};

export default useStepLogic;
