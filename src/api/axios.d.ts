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
/**
 * 重写axios
 * @author Tracy
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import axios from 'axios';

declare module 'axios' {
	export interface AxiosInstance {
		request<T = any>(config: AxiosRequestConfig): Promise<T>;
		get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
		delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
		head<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
		post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
		put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
		patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
	}
}
