import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'antd';

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
	const { data } = response;
	console.log(2222, data.Code);
	if (data.Code !== '00000') {
		message.error(data.Message, 5);
		return Promise.reject(new Error(data.Message || 'Error'));
	} else {
		return Promise.resolve(data);
	}
};
const requestFaild = (error: AxiosError) => {
	return Promise.reject(error);
};
RequestHttp.interceptors.response.use(requestSuccess, requestFaild);
// 统一错误处理

export default RequestHttp;
