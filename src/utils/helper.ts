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
import RequestHttp from '@/api';
import APIConfig from '@/api/config';
//轮询
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
		// 内部终止逻辑
		try {
			const data = await pollFunction();
			shouldCancel = data.length
				? data.every(element => {
						//兼容几种不同轮询的终止判断
						return lockedState.includes(element.NodeState || element.SCStateEnum || element.JobExecStateEnum);
				  })
				: true;
			callback(data);
		} catch (error) {
			console.error('轮询终止:', error);
			shouldCancel = true;
		}
	};
	intervalFunction();
	poller = setInterval(intervalFunction, interval);
	return () => clearInterval(poller);
};

// 更新当前集群
export const updateCurrentView = async (clusterId: string | number) => {
	const api = APIConfig.updateCurrentView;
	const data = await RequestHttp.post(api, { ClusterId: clusterId });
	return Promise.resolve(data);
};

// 截取字符串中的大写字母和数字，组成新的字符串，用处：例如组件名称的缩写
export const extractUpperCaseAndNumbers = (str: string) => {
	// 正则表达式匹配大写字母和数字
	const regex = /[A-Z0-9]/g;
	// 使用match方法找到所有匹配项
	const matches = str.match(regex);
	// 如果找到匹配项，使用join方法将它们组合成一个新字符串
	// 否则，返回一个空字符串
	return matches ? matches.join('') : '';
};

export const getNavigationType = () => {
	let navigationType;
	let navigationEntry;

	if (typeof performance.navigation !== 'undefined') {
		// Safari 和一些其他浏览器支持 performance.navigation
		navigationType = performance.navigation.type;
	} else if (performance.getEntriesByType && typeof performance.getEntriesByType('navigation') !== 'undefined') {
		// Chrome、Edge 等基于 Chromium 的浏览器可能使用这种方法
		navigationEntry = performance.getEntriesByType('navigation')[0];
		if (navigationEntry) {
			navigationType = navigationEntry.type;
		}
	}

	// 返回导航类型，如果没有获取到则返回 undefined
	return navigationType;
};

// 将 Prometheus 数据转换为 Ant Design Charts 所需格式的函数
export const transformData = (prometheusData: [number, string, string][]) => {
	// 使用 map 方法遍历原始数据数组，转换为 Ant Design Charts 所需格式
	const formattedData = prometheusData.map(item => {
		// 获取时间戳和值
		const timestamp = item[0];
		const value = parseFloat(item[1]); // 将字符串值转换为数字

		// 返回 Ant Design Charts 所需格式的对象
		return {
			x: new Date(timestamp * 1000), // 将时间戳转换为 JavaScript Date 对象
			y: value, // 值
			type: item[2]
		};
	});

	return formattedData;
};
// 时间戳转换为“几小时前”
export const timestampToHoursAgo = (timestamp: number): string => {
	// 获取当前时间戳（毫秒）
	const currentTimestamp = Date.now();

	// 计算时间差（毫秒）
	const timeDiffMilliseconds = currentTimestamp - timestamp;

	// 将时间差转换为小时（注意：1小时 = 1000 * 60 * 60毫秒）
	const hoursDiff = timeDiffMilliseconds / (1000 * 60 * 60);

	// 格式化输出，保留两位小数
	return `${hoursDiff.toFixed(2)}`;
};

// n分钟之前时间戳

export const getCurrentAndPastTimestamps = (n: number) => {
	// 创建一个新的Date对象，表示当前时间
	let now = new Date();

	// 获取当前时间戳
	let currentTimestamp = now.getTime();

	// 创建一个新的Date对象，设置为n分钟前的时间
	let past = new Date(now.getTime() - n * 60 * 1000);

	// 获取5分钟前的时间戳
	let pastTimestamp = past.getTime();

	// 返回结果对象
	return {
		current: currentTimestamp,
		past: pastTimestamp
	};
};

// 计算两个时间戳相差的分钟数
export const diffInMinutes = (timestamp1, timestamp2) => {
	// 确保timestamp1是较后的时间戳，timestamp2是较早的时间戳
	let diff = Math.max(timestamp1, timestamp2) - Math.min(timestamp1, timestamp2);

	// 将毫秒差转换为分钟
	let minutesDiff = Math.round(diff / (1000 * 60));

	return minutesDiff;
};
