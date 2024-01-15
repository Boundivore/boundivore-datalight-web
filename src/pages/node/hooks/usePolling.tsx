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
import { useEffect, useState, useRef } from 'react';
import { pollRequest } from '@/utils/helper';

interface DataType {
	NodeId: React.Key;
	Hostname: string;
	CpuCores: number;
	CpuArch: string;
	DiskTotal: string;
	NodeState: string;
}

const usePolling = (fetchData: Promise, stableStates: string[], interval: number): DataType[] => {
	const [data, setData] = useState<DataType[]>([]);
	const stopPollingRef = useRef<Function>();

	useEffect(() => {
		const callback = (stateData: DataType[]) => {
			setData(stateData);
		};
		stopPollingRef.current = pollRequest(fetchData, callback, stableStates, interval);

		return () => stopPollingRef.current();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return data;
};

export default usePolling;
