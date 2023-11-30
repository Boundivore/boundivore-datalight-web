export const pollRequest = (
	pollFunction: () => Promise<{ data: any; code: string }>,
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

		const { data, code } = await pollFunction();

		if (code === status) {
			shouldCancel = true;
			clearInterval(poller);
		}
		return data;
	}, interval);
};
