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
