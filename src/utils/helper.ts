export const pollRequest = (
	pollFunction: () => Promise<{ data: any }>,
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
		shouldCancel = data.length
			? data.every(element => {
					return lockedState.includes(element.NodeState);
			  })
			: false;
		console.log(
			'test',
			data.every(element => {
				return lockedState.includes(element.NodeState);
			})
		);
		console.log('test2', shouldCancel);
		// 内部终止逻辑
		// if (locked) {
		// 	shouldCancel = true;
		// 	clearInterval(poller);
		// }
		console.log(111, data);
		callback(data);
	};
	intervalFunction();
	poller = setInterval(intervalFunction, interval);
	return () => clearInterval(poller);
};
