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
 * usePolling - 自定义Hook
 * 轮询调用fetchData
 * @author Tracy
 */
import { useEffect, useState, useRef } from 'react';
import { pollRequest } from '@/utils/helper';

const usePolling = (fetchData: () => Promise<any[]>, stableStates: string[], interval: number, dependency: any[]) => {
	const [data, setData] = useState([]);
	const stopPollingRef = useRef<Function>();

	useEffect(() => {
		if (dependency[0]) {
			const callback = (stateData: []) => {
				setData(stateData);
			};
			stopPollingRef.current = pollRequest(fetchData, callback, stableStates, interval);
		}

		return () => {
			if (stopPollingRef.current) {
				stopPollingRef.current();
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, dependency);

	return data;
};

export default usePolling;
