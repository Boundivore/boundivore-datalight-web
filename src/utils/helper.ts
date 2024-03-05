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
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
//轮询
export const pollRequest = (
	pollFunction: () => Promise<Array<any>>,
	callback: Function,
	lockedState: string[],
	interval: number = 2000
) => {
	let poller: NodeJS.Timeout;
	let shouldCancel = false;
	const intervalFunction = async () => {
		if (shouldCancel) {
			clearInterval(poller);
			return;
		}
		// 内部终止逻辑
		try {
			const data = await pollFunction();
			shouldCancel = data.length
				? data.every(element => {
						//兼容几种不同轮询的终止判断
						return lockedState.includes(element.NodeState || element.SCStateEnum || element.JobExecStateEnum);
				  })
				: true;
			callback(data);
		} catch (error) {
			console.error('轮询终止:', error);
			shouldCancel = true;
		}
	};
	intervalFunction();
	poller = setInterval(intervalFunction, interval);
	return () => clearInterval(poller);
};

// 更新当前集群
export const updateCurrentView = async (clusterId: string | number) => {
	const api = APIConfig.updateCurrentView;
	const data = await RequestHttp.post(api, { ClusterId: clusterId });
	return Promise.resolve(data);
};
