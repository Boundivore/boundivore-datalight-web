// store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(set => ({
	isNeedChangePassword: false,
	setIsNeedChangePassword: (changePassword: boolean) => set({ isNeedChangePassword: changePassword }),
	selectedRowsList: [],
	setSelectedRowsList: (rows: object[]) => set({ selectedRowsList: rows }),
	jobClusterId: '',
	setJobClusterId: (id: string) => set({ jobClusterId: id }),
	jobNodeId: '',
	setJobNodeId: (id: string) => set({ jobNodeId: id }),
	stepCurrent: 5,
	setStepCurrent: (current: number) => set({ stepCurrent: current }),
	stepMap: {
		PROCEDURE_BEFORE_PARSE: 0,
		PROCEDURE_PARSE_HOSTNAME: 1,
		PROCEDURE_DETECT: 2,
		PROCEDURE_CHECK: 3,
		PROCEDURE_DISPATCH: 4,
		PROCEDURE_ADD_NODE_DONE: 5
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
		}
	},
	stableState: []
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

export default useStore;
