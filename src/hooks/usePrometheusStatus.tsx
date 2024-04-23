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
 * usePrometheusStatus - 自定义Hook
 * 查询是否部署Prometheus
 * @author Tracy
 */
import { useState, useEffect } from 'react';
import APIConfig from '@/api/config';
import RequestHttp from '@/api';
import useCurrentCluster from '@/hooks/useCurrentCluster';

const STARTED_STATE = 'STARTED';

const usePrometheusStatus = () => {
	const { selectCluster } = useCurrentCluster();
	const [hasPrometheus, setHasPrometheus] = useState(false);

	const getPrometheusStatus = async () => {
		const api = APIConfig.getPrometheusStatus;
		const params = {
			ClusterId: selectCluster,
			ServiceName: 'MONITOR',
			ComponentName: 'Prometheus'
		};
		const {
			Data: { ComponentSimpleList }
		} = await RequestHttp.get(api, { params });
		const prometheusStatus =
			ComponentSimpleList[0]?.NodeState === STARTED_STATE && ComponentSimpleList[0]?.SCStateEnum === STARTED_STATE;

		setHasPrometheus(prometheusStatus);
	};
	useEffect(() => {
		selectCluster && getPrometheusStatus();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectCluster]);

	return { hasPrometheus };
};

export default usePrometheusStatus;
