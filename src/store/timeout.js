export const Timeout = (time) => {
	let controller = new AbortController();
	setTimeout(() => controller.abort(), time);
	return controller;
};