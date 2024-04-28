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
	[property: string]: any;
}

/**
 * AllNodeJobTransferProgressVo
 */
export interface AllNodeJobTransferProgressVo {
	ClusterId: number;
	NodeJobId: number;
	NodeJobTransferProgressList: NodeJobTransferProgressVo[];
	[property: string]: any;
}

/**
 * NodeJobTransferProgressVo
 */
export interface NodeJobTransferProgressVo {
	CurrentFileProgress: CurrentFileProgressVo;
	ExecState: ExecState;
	FileBytesProgress: FileBytesProgressVo;
	FileCountProgress: FileCountProgressVo;
	Hostname: string;
	NodeId: string;
	NodeStepId: number;
	NodeTaskId: number;
	[property: string]: any;
}

/**
 * CurrentFileProgressVo
 */
export interface CurrentFileProgressVo {
	CurrentFileBytes: number;
	CurrentFilename: string;
	CurrentFileProgress: number;
	CurrentFileTransferBytes: number;
	CurrentPrintSpeed: string;
	[property: string]: any;
}

export enum ExecState {
	Error = 'ERROR',
	NotExist = 'NOT_EXIST',
	Ok = 'OK',
	Running = 'RUNNING',
	Suspend = 'SUSPEND'
}

/**
 * FileBytesProgressVo
 */
export interface FileBytesProgressVo {
	TotalBytes: number;
	TotalProgress: number;
	TotalTransferBytes: number;
	[property: string]: any;
}

/**
 * FileCountProgressVo
 */
export interface FileCountProgressVo {
	TotalFileCount: number;
	TotalFileCountProgress: number;
	TotalTransferFileCount: number;
	[property: string]: any;
}

/**
 * Page
 */
export interface Page {
	CurrentPage: number;
	PageSize: number;
	TotalPage: number;
	TotalSize: number;
	[property: string]: any;
}
/**
 * ClusterType
 * @export
 * @interface ClusterType
 */
export interface ClusterType {
	HasAlreadyNode: boolean;
	ClusterId: string;
	ClusterState: string;
	ClusterDesc: string;
	ClusterName: string;
	ClusterType: ClusterNewRequestClusterTypeEnum;
	DlcVersion: string;
	RelativeClusterId: number;
	IsCurrentView: boolean;
	IsExistInitProcedure: boolean;
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
/**
 * 登录用户信息
 */
export interface UserInfoType {
	userId: string;
	nickName: string;
	realName: string;
}

/**
 * ConfigSummaryVo
 * @export
 * @interface ConfigSummaryVo
 */
export interface ConfigSummaryVo {
	ConfigPath: string;
	FileName: string;
}
/**
 * ConfigSummaryListVo
 * @export
 * @interface ConfigSummaryListVo
 */
export interface ConfigSummaryListVo {
	/**
	 *
	 * @type {number}
	 * @memberof ConfigSummaryListVo
	 */
	ClusterId: number;
	/**
	 *
	 * @type {Array<ConfigSummaryVo>}
	 * @memberof ConfigSummaryListVo
	 */
	ConfigSummaryList: Array<ConfigSummaryVo>;
	/**
	 *
	 * @type {string}
	 * @memberof ConfigSummaryListVo
	 */
	ServiceName: string;
}

/**
 * JobProgressVo
 */
export interface JobProgressVo {
	ClusterId: number;
	JobExecProgress: JobExecProgressVo;
	JobId: number;
	JobPlanProgress: JobPlanProgressVo;
	[property: string]: any;
}

/**
 * JobExecProgressVo
 */
export interface JobExecProgressVo {
	ClusterId: number;
	ExecCurrent: number;
	ExecProgress: number;
	ExecProgressPerNodeList: ExecProgressPerNodeVo[];
	ExecTotal: number;
	JobExecStateEnum: StepExecState;
	JobId: number;
	[property: string]: any;
}
/**
 * ExecProgressPerNodeVo
 */
export interface ExecProgressPerNodeVo {
	ExecCurrent: number;
	ExecProgress: number;
	ExecProgressStepList: ExecProgressStepVo[];
	ExecTotal: number;
	Hostname: string;
	NodeId: number;
	NodeIp: string;
	NodeTaskId: number;
	NodeTaskName: string;
	[property: string]: any;
}

/**
 * ExecProgressStepVo
 */
export interface ExecProgressStepVo {
	NodeStepId: number;
	NodeStepName: string;
	NodeStepType: NodeStepType;
	StepExecState: StepExecState;
	[property: string]: any;
}

/**
 * JobPlanProgressVo
 */
export interface JobPlanProgressVo {
	ActionType: ActionType;
	ClusterId: number;
	JobId: number;
	PlanCurrent: number;
	PlanName: string;
	PlanProgress: number;
	PlanTotal: number;
	[property: string]: any;
}
export enum StepExecState {
	Error = 'ERROR',
	NotExist = 'NOT_EXIST',
	Ok = 'OK',
	Running = 'RUNNING',
	Suspend = 'SUSPEND'
}
export enum ActionType {
	Decommission = 'DECOMMISSION',
	Deploy = 'DEPLOY',
	Remove = 'REMOVE',
	Restart = 'RESTART',
	Start = 'START',
	Stop = 'STOP'
}
export enum NodeStepType {
	CheckEnv = 'CHECK_ENV',
	Command = 'COMMAND',
	Push = 'PUSH',
	Scan = 'SCAN',
	ScanResources = 'SCAN_RESOURCES',
	Script = 'SCRIPT'
}

/**
 * ServiceComponentSummaryVo
 */
export interface ServiceComponentSummaryVo {
	ComponentSummaryList: ComponentSummaryVo[];
	ServiceSummary: ServiceSummaryVo;
	[property: string]: any;
}

/**
 * ComponentSummaryVo
 */
export interface ComponentSummaryVo {
	ComponentName: string;
	ComponentNodeList: ComponentNodeVo[];
	Max: number;
	Min: number;
	MutexesList: string[];
	Priority: number;
	[property: string]: any;
}

/**
 * ComponentNodeVo
 */
export interface ComponentNodeVo {
	ComponentId: number;
	Hostname: string;
	NeedRestart: boolean;
	NodeId: number;
	NodeIp: string;
	NodeState: NodeState;
	SCStateEnum: SCStateEnum;
	[property: string]: any;
}

export enum NodeState {
	Active = 'ACTIVE',
	CheckError = 'CHECK_ERROR',
	CheckOk = 'CHECK_OK',
	Checking = 'CHECKING',
	Detecting = 'DETECTING',
	Inactive = 'INACTIVE',
	Maintenance = 'MAINTENANCE',
	MaintenanceAdd = 'MAINTENANCE_ADD',
	MaintenanceAlter = 'MAINTENANCE_ALTER',
	PushError = 'PUSH_ERROR',
	PushOk = 'PUSH_OK',
	Pushing = 'PUSHING',
	Removed = 'REMOVED',
	Resolved = 'RESOLVED',
	Restarting = 'RESTARTING',
	StartWorkerError = 'START_WORKER_ERROR',
	StartWorkerOk = 'START_WORKER_OK',
	Started = 'STARTED',
	Starting = 'STARTING',
	StartingWorker = 'STARTING_WORKER',
	Stopped = 'STOPPED',
	Stopping = 'STOPPING',
	Unknown = 'UNKNOWN'
}

export enum SCStateEnum {
	BeingDecommissioned = 'BEING_DECOMMISSIONED',
	Changing = 'CHANGING',
	Decommissioned = 'DECOMMISSIONED',
	Deployed = 'DEPLOYED',
	Deploying = 'DEPLOYING',
	Removed = 'REMOVED',
	Restarting = 'RESTARTING',
	Selected = 'SELECTED',
	SelectedAddition = 'SELECTED_ADDITION',
	Started = 'STARTED',
	Starting = 'STARTING',
	Stopped = 'STOPPED',
	Stopping = 'STOPPING',
	Unselected = 'UNSELECTED'
}

/**
 * ServiceSummaryVo
 */
export interface ServiceSummaryVo {
	DependencyList: string[];
	Desc: string;
	Priority: number;
	SCStateEnum: SCStateEnum;
	ServiceName: string;
	ServiceType: ServiceType;
	Tgz: string;
	Version: string;
	[property: string]: any;
}

export enum ServiceType {
	Base = 'BASE',
	Compute = 'COMPUTE',
	Monitor = 'MONITOR',
	Others = 'OTHERS',
	Storage = 'STORAGE'
}

/**
 * ConfigGroupVo
 */
export interface ConfigGroupVo {
	ConfigData: string;
	ConfigNodeList: ConfigNodeVo[];
	ConfigPath: string;
	Filename: string;
	Sha256: string;
	[property: string]: any;
}
/**
 * ConfigNodeVo
 */
export interface ConfigNodeVo {
	ConfigVersion: number;
	Hostname: string;
	NodeId: number;
	NodeIp: string;
	[property: string]: any;
}

export interface StepRefType {
	handleOk: () => void;
}

/**
 * ComponentRequest
 */
export interface ComponentRequest {
	ComponentName: string;
	NodeIdList: number[];
	SCStateEnum: SCStateEnum;
	ServiceName: string;
	[property: string]: any;
}

// 用户相关
/**
 * UserInfoListVo
 */
export interface UserInfoListVo {
	UserInfoList: UserInfoVo[];
	[property: string]: any;
}

/**
 * UserInfoVo
 */
export interface UserInfoVo {
	Avatar: string;
	CreateTime: number;
	IsNeedChangePassword: boolean;
	LastLogin: number;
	Nickname: string;
	Realname: string;
	Token: string;
	TokenTimeout: number;
	UpdateTime: number;
	UserId: number;
	[property: string]: any;
}
//角色相关

/**
 * RoleListVo
 */
export interface RoleListVo {
	/**
	 * 角色信息列表
	 */
	RoleList: RoleVo[];
	[property: string]: any;
}

/**
 * RoleVo
 */
export interface RoleVo {
	/**
	 * 是否可编辑
	 */
	EditEnabled: boolean;
	/**
	 * 是否启用标记
	 */
	Enabled: boolean;
	/**
	 * 角色编码
	 */
	RoleCode: string;
	/**
	 * 角色备注
	 */
	RoleComment?: string;
	/**
	 * 角色 ID
	 */
	RoleId: number | string;
	/**
	 * 角色名称
	 */
	RoleName: string;
	/**
	 * 角色类型
	 */
	RoleType: RoleType;
	[property: string]: any;
}

/**
 * 角色类型
 */
export enum RoleType {
	RoleDynamic = 'ROLE_DYNAMIC',
	RoleStatic = 'ROLE_STATIC'
}

// 权限相关
/**
 * PermissionListVo
 */
export interface PermissionListVo {
	/**
	 * 权限主体列表 响应体
	 */
	PermissionList: PermissionVo[];
	[property: string]: any;
}

/**
 * PermissionVo
 */
export interface PermissionVo {
	/**
	 * 是否生效
	 */
	Enabled: boolean;
	/**
	 * 是否删除
	 */
	IsDeleted: boolean;
	/**
	 * 权限编码
	 */
	PermissionCode: string;
	/**
	 * 权限备注
	 */
	PermissionComment: string;
	/**
	 * 权限主键 ID
	 */
	PermissionId: number;
	/**
	 * 权限名称
	 */
	PermissionName: string;
	/**
	 * 权限类型 枚举：PERMISSION_INTERFACE(0, 接口操作权限),PERMISSION_DATA_ROW(1,
	 * 数据行读权限),PERMISSION_DATA_COLUMN(2, 数据列读权限),PERMISSION_PAGE(3, 页面操作权限);
	 */
	PermissionType: PermissionType;
	/**
	 * 权限权重 优先级，取值范围：1 ~ 10
	 */
	PermissionWeight: number;
	/**
	 * 互斥权限编码
	 */
	RejectPermissionCode: string;
	/**
	 * 规则主键 ID
	 */
	RuleId: number;
	[property: string]: any;
}

/**
 * 权限类型 枚举：PERMISSION_INTERFACE(0, 接口操作权限),PERMISSION_DATA_ROW(1,
 * 数据行读权限),PERMISSION_DATA_COLUMN(2, 数据列读权限),PERMISSION_PAGE(3, 页面操作权限);
 */
export enum PermissionType {
	PermissionDataColumn = 'PERMISSION_DATA_COLUMN',
	PermissionDataRow = 'PERMISSION_DATA_ROW',
	PermissionInterface = 'PERMISSION_INTERFACE',
	PermissionPage = 'PERMISSION_PAGE'
}

/**
 * ComponentWebUI
 */
export interface ComponentWebUI {
	ComponentName: string;
	ShowName: string;
	Url: string;
	[property: string]: any;
}

// 日志相关
/**
 * JobLogListVo
 */
export interface JobLogListVo {
	ClusterId: number;
	JobLogList: JobLogVo[];
	Tag: string;
	[property: string]: any;
}

/**
 * JobLogVo
 */
export interface JobLogVo {
	JobId: number;
	LogErrOut: string;
	LogStdOut: string;
	NodeId: number;
	StageId: number;
	StepId: number;
	TaskId: number;
	[property: string]: any;
}
/**
 * NodeJobLogListVo
 */
export interface NodeJobLogListVo {
	ClusterId: number;
	NodeJobLogList: NodeJobLogVo[];
	Tag: string;
	[property: string]: any;
}

/**
 * NodeJobLogVo
 */
export interface NodeJobLogVo {
	LogErrOut: string;
	LogStdOut: string;
	NodeId: number;
	NodeJobId: number;
	NodeTaskId: number;
	StepId: number;
	[property: string]: any;
}
