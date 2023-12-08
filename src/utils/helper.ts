export const pollRequest = (
	pollFunction: () => Promise<{ data: any }>,
	callback: Function,
	status: string,
	interval: number = 2000
) => {
	let poller: NodeJS.Timeout;
	let shouldCancel = false;
	const intervalFunction = async () => {
		if (shouldCancel) {
			clearInterval(poller);
			return;
		}
		const { Data, Code } = await pollFunction();
		// 内部终止逻辑
		if (Code === status) {
			shouldCancel = true;
			clearInterval(poller);
		}
		callback(Data);
	};
	intervalFunction();
	poller = setInterval(intervalFunction, interval);
	return () => clearInterval(poller);
};
