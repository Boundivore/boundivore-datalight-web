export const pollRequest = (
	pollFunction: () => Promise<{ data: any; codeStatus: string }>,
	status: string,
	interval: number = 2000
) => {
	let poller: NodeJS.Timeout;
	let shouldCancel = false;

	poller = setInterval(async function () {
		if (shouldCancel) {
			clearInterval(poller);
			return;
		}

		const { data, codeStatus } = await pollFunction();
		console.log(data);

		if (codeStatus === status) {
			shouldCancel = true;
			clearInterval(poller);
		}
	}, interval);
};
