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

// 二次封装axios
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'antd';
import { BackendResponse } from '@/api/interface';

const config = {
	timeout: 1000 * 10,
	withCredentials: true
};
// 创建一个实例，在实例上改造
const RequestHttp = axios.create(config);
// 拦截器
// 请求拦截器
const beforeRequest = (config: AxiosRequestConfig) => {
	const token = localStorage.getItem('token');
	console.log(222, config.headers);
	token && (config.headers.Authorization = token);
	// NOTE  添加自定义头部
	// config?.headers['my-header'] = 'jack';
	return { ...config, headers: { ...config.headers, 'x-access-token': token } };
};
RequestHttp.interceptors.request.use(beforeRequest, (error: AxiosError) => {
	return Promise.reject(error);
});
// 响应拦截器
const requestSuccess = (response: AxiosResponse) => {
	const { data }: { data: BackendResponse } = response;
	const { Code, Message } = data;
	if (Code !== '00000' && Code !== 'D1001') {
		message.error(Message, 5);
		Code[0] === 'H' && (window.location.href = '/auth/login'); // ‘H’前缀代表鉴权失效，跳转至登录页
		return Promise.reject(new Error(Message || 'Error'));
	} else {
		return Promise.resolve(data);
	}
};
const requestFaild = (error: AxiosError) => {
	return Promise.reject(error);
};
// @ts-ignore
RequestHttp.interceptors.response.use(requestSuccess, requestFaild);
// 统一错误处理

export default RequestHttp;
