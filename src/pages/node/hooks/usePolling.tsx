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
