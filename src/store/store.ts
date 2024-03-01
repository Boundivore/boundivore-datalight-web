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
// store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
interface MyStore {
	isNeedChangePassword: boolean; //当前用户是否需要修改密码
	setIsNeedChangePassword: (changePassword: boolean) => void;
	selectedServiceRowsList: object[]; // 已选择的服务列表
	setSelectedServiceRowsList: (rows: object[]) => void;
	jobClusterId: string; //当前操作的集群id
	setJobClusterId: (id: string) => void;
	jobNodeId: string; // 当前操作的节点id
	setJobNodeId: (id: string) => void;
	jobId: string; // 部署任务id
	setJobId: (id: string) => void;
	stepCurrent: number; // 当前进度
	setStepCurrent: (current: number) => void;
	stepMap: Record<string, number>; // 或者具体的映射类型
	stateText: Record<string, { label: string; status: string }>;
	stableState: string[];
	configGroupInfo: object[]; // 修改配置文件时的分组信息
	setConfigGroupInfo: (group: object[]) => void;
	currentPageDisabled: PageDisabledType; // 当前页面操作的置灰状态
	setCurrentPageDisabled: (state: PageDisabledType) => void;
}
interface PageDisabledType {
	next: boolean;
	// 如果将来还有其他属性，可以在这里添加
}
interface UserInfoType {
	userId: string;
	nickName: string;
	realName: string;
	// 其他可能的用户信息字段...
}
interface PersistStore {
	userInfo: UserInfoType;
	setUserInfo: (info: UserInfoType) => void;
}
interface ComponentAndNodeStore {
	nodeList: object;
	setNodeList: (info: object) => void;
	selectedRowsList: object; // 已选择的节点列表, 这个列表是集群引导全流程中的每一步里都可能不相同，因此需要记录所有
	setSelectedRowsList: (key: string, rows: object[]) => void;
}
const useStore = create<MyStore>(set => ({
	isNeedChangePassword: false,
	setIsNeedChangePassword: (changePassword: boolean) => set({ isNeedChangePassword: changePassword }),
	selectedServiceRowsList: [],
	setSelectedServiceRowsList: (rows: object[]) => set({ selectedServiceRowsList: rows }),
	jobClusterId: '',
	setJobClusterId: (id: string) => set({ jobClusterId: id }),
	jobNodeId: '',
	setJobNodeId: (id: string) => set({ jobNodeId: id }),
	jobId: '',
	setJobId: (id: string) => set({ jobId: id }),
	stepCurrent: 0,
	setStepCurrent: (current: number) => set({ stepCurrent: current }),
	// 步骤映射关系
	stepMap: {
		PROCEDURE_BEFORE_PARSE: 0,
		PROCEDURE_PARSE_HOSTNAME: 1,
		PROCEDURE_DETECT: 2,
		PROCEDURE_CHECK: 3,
		PROCEDURE_DISPATCH: 4,
		PROCEDURE_START_WORKER: 5,
		PROCEDURE_ADD_NODE_DONE: 6,
		PROCEDURE_SELECT_SERVICE: 7 + 1, // 服役节点到指定集群之后进度展示逻辑调整, 当前也操作结束，不存在下一页的列表轮询，直接进入下一阶段，所以 + 1
		PROCEDURE_SELECT_COMPONENT: 8 + 1,
		PROCEDURE_PRE_CONFIG: 9,
		PROCEDURE_DEPLOYING: 10
	},
	stateText: {
		STARTED: {
			label: 'node.started',
			status: 'success'
		},
		RESOLVED: {
			label: 'node.resolved',
			status: 'success'
		},
		ACTIVE: {
			label: 'node.active',
			status: 'success'
		},
		DETECTING: {
			label: 'node.detecting',
			status: 'processing'
		},
		INACTIVE: {
			label: 'node.inactive',
			status: 'error'
		},
		CHECK_OK: {
			label: 'node.check_ok',
			status: 'success'
		},
		CHECKING: {
			label: 'node.checking',
			status: 'processing'
		},
		CHECK_ERROR: {
			label: 'node.check_error',
			status: 'error'
		},
		PUSHING: {
			label: 'node.pushing',
			status: 'processing'
		},
		PUSH_OK: {
			label: 'node.push_ok',
			status: 'success'
		},
		PUSH_ERROR: {
			label: 'node.push_ok',
			status: 'error'
		},
		START_WORKER_OK: {
			label: 'node.start_worker_ok',
			status: 'success'
		},
		STARTING_WORKER: {
			label: 'node.starting_worker',
			status: 'processing'
		},
		START_WORKER_ERROR: {
			label: 'node.start_worker_error',
			status: 'error'
		},
		UNSELECTED: {
			label: 'service.unselected',
			status: 'error'
		},
		SELECTED: {
			label: 'service.selected',
			status: 'success'
		},
		DEPLOYED: {
			label: 'service.deployed',
			status: 'success'
		},
		SELECTED_ADDITION: {
			label: 'service.selected',
			status: 'success'
		}
	},
	// 配置停止轮询的条件
	stableState: [
		'RESOLVED',
		'ACTIVE',
		'INACTIVE',
		'CHECK_OK',
		'CHECK_ERROR',
		'PUSH_OK',
		'PUSH_ERROR',
		'START_WORKER_OK',
		'START_WORKER_ERROR',
		'UNSELECTED'
	],
	configGroupInfo: [],
	setConfigGroupInfo: (group: object[]) => set({ configGroupInfo: group }),
	currentPageDisabled: { next: true },
	setCurrentPageDisabled: (state: PageDisabledType) => set({ currentPageDisabled: state })
}));
export const usePersistStore = create<PersistStore>()(
	persist(
		set => ({
			userInfo: {} as UserInfoType,
			setUserInfo: (info: UserInfoType) => set({ userInfo: info })
		}),
		{
			name: 'user-storage' // name of the item in the storage (must be unique)
		}
	)
);
export const useComponentAndNodeStore = create<ComponentAndNodeStore>()(
	persist(
		set => ({
			nodeList: {},
			setNodeList: (node: object) => set({ nodeList: node }),
			selectedRowsList: {
				PROCEDURE_PARSE_HOSTNAME: [],
				PROCEDURE_DETECT: [],
				PROCEDURE_CHECK: [],
				PROCEDURE_DISPATCH: [],
				PROCEDURE_START_WORKER: []
			},
			setSelectedRowsList: (key: string, rows: object[]) =>
				set(state => ({ selectedRowsList: { ...state.selectedRowsList, [key]: rows } }))
		}),
		{
			name: 'node-storage', // name of the item in the storage (must be unique)
			storage: createJSONStorage(() => sessionStorage)
		}
	)
);

export default useStore;
