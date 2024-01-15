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
		const data = await pollFunction();
		// 内部终止逻辑
		shouldCancel = data.length
			? data.every(element => {
					return lockedState.includes(element.NodeState || element.SCStateEnum);
			  })
			: false;
		console.log(111, data);
		callback(data);
	};
	intervalFunction();
	poller = setInterval(intervalFunction, interval);
	return () => clearInterval(poller);
};
