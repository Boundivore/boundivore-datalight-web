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
 * ClusterType
 * @export
 * @interface ClusterType
 */
export interface ClusterType {
	HasAlreadyNode: boolean;
	ClusterId: number;
	ClusterState: string;
	ClusterDesc: string;
	ClusterName: string;
	ClusterType: ClusterNewRequestClusterTypeEnum;
	DlcVersion: string;
	RelativeClusterId: number;
	IsCurrentView: boolean;
}

/**
 * @export
 * @enum {string}
 */
export enum ClusterNewRequestClusterTypeEnum {
	COMPUTE = 'COMPUTE',
	MIXED = 'MIXED'
}
/**
 * @export
 * @interface ParseHostnameType 解析节点主机名
 */
export interface ParseHostnameType {
	Hostname: string;
	SshPort: string | number;
}
/**
 * @export
 * @interface NodeType 节点
 */
export interface NodeType {
	[x: string]: any;
	NodeId: string;
	Hostname: string;
	CpuCores: number;
	CpuArch: string;
	DiskTotal: string;
	NodeState: string;
	SshPort: number | string;
}
/**
 * @export
 * @interface NodeWithComponent 附带组件信息的节点
 */
export interface NodeWithComponent {
	ComponentName: string[];
	NodeDetail: NodeType;
}
/**
 * @export
 * @interface ServiceItemType 服务
 */
export interface ServiceItemType {
	[x: string]: any;
	ServiceType: string;
	ServiceName: string;
	SCStateEnum: string;
	Desc: string;
	DependencyList: string[];
	Priority: number | string;
	Version: string;
	Tgz: string;
}
/**
 * @export
 * @type BadgeStatus 徽标状态
 */
export type BadgeStatus = 'success' | 'processing' | 'default' | 'error' | 'warning';

export interface UserInfoType {
	userId: string;
	nickName: string;
	realName: string;
}
