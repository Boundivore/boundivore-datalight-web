// store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(set => ({
	isNeedChangePassword: false,
	setIsNeedChangePassword: (changePassword: boolean) => set({ isNeedChangePassword: changePassword }),
	selectedRowsList: [],
	setSelectedRowsList: (rows: object[]) => set({ selectedRowsList: rows }),
	selectedServiceRowsList: [],
	setSelectedServiceRowsList: (rows: object[]) => set({ selectedServiceRowsList: rows }),
	jobClusterId: '',
	setJobClusterId: (id: string) => set({ jobClusterId: id }),
	jobNodeId: '',
	setJobNodeId: (id: string) => set({ jobNodeId: id }),
	stepCurrent: 0,
	setStepCurrent: (current: number) => set({ stepCurrent: current }),
	stepMap: {
		PROCEDURE_BEFORE_PARSE: 0,
		PROCEDURE_PARSE_HOSTNAME: 1,
		PROCEDURE_DETECT: 2,
		PROCEDURE_CHECK: 3,
		PROCEDURE_DISPATCH: 4,
		PROCEDURE_START_WORKER: 5,
		PROCEDURE_ADD_NODE_DONE: 6,
		PROCEDURE_SELECT_SERVICE: 7
	},
	stateText: {
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
			status: 'success'
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
		}
	},
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
	]
}));
export const usePersistStore = create(
	persist(
		set => ({
			userInfo: {},
			setUserInfo: (info: object) => set({ userInfo: info })
		}),
		{
			name: 'user-storage' // name of the item in the storage (must be unique)
		}
	)
);
export const useComponentAndNodeStore = create(
	persist(
		set => ({
			nodeList: {},
			setNodeList: (node: object) => set({ nodeList: node })
		}),
		{
			name: 'node-storage' // name of the item in the storage (must be unique)
		}
	)
);

export default useStore;
