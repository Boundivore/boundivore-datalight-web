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

// 定义后端响应数据结构
export interface BackendResponse {
	Code: string;
	Data: object;
	Message: string;
	MessageType: string;
	Timestamp: string;
}
/**
 * ClusterNewRequest
 * @export
 * @interface ClusterNewRequest
 */
export interface ClusterNewRequest {
	ClusterDesc: string;
	ClusterName: string;
	ClusterType: ClusterNewRequestClusterTypeEnum;
	DlcVersion: string;
	RelativeClusterId: number;
}

/**
 * @export
 * @enum {string}
 */
export enum ClusterNewRequestClusterTypeEnum {
	COMPUTE = 'COMPUTE',
	MIXED = 'MIXED'
}
