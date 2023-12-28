export const pollRequest = (
	pollFunction: () => Promise<{ data: any }>,
	callback: Function,
	lockedState: [string],
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
		shouldCancel = data.Data.NodeInitDetailList.every(element => {
			return lockedState.includes(element.NodeState);
		});
		// 内部终止逻辑
		// if (locked) {
		// 	shouldCancel = true;
		// 	clearInterval(poller);
		// }
		console.log(111, data);
		callback(data.Data);
	};
	intervalFunction();
	poller = setInterval(intervalFunction, interval);
	return () => clearInterval(poller);
};
