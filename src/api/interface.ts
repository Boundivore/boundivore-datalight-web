/**
 * ClusterNewRequest
 * @export
 * @interface ClusterNewRequest
 */
export interface ClusterNewRequest {
	/**
	 *
	 * @type {string}
	 * @memberof ClusterNewRequest
	 */
	ClusterDesc: string;
	/**
	 *
	 * @type {string}
	 * @memberof ClusterNewRequest
	 */
	ClusterName: string;
	/**
	 *
	 * @type {string}
	 * @memberof ClusterNewRequest
	 */
	ClusterType: ClusterNewRequestClusterTypeEnum;
	/**
	 *
	 * @type {string}
	 * @memberof ClusterNewRequest
	 */
	DlcVersion: string;
	/**
	 *
	 * @type {number}
	 * @memberof ClusterNewRequest
	 */
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
