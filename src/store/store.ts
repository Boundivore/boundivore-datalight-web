// store.ts
import { create } from 'zustand';

const useStore = create(set => ({
	// parsedList: [],
	// setParsedList: (list: object[]) => set({ parsedList: list }),
	// detectedList: [],
	// setDetectedList: (list: object[]) => set({ detectedList: list }),
	// checkedList: [],
	// setCheckedList: (list: object[]) => set({ checkedList: list }),
	// dispatchedList: [],
	// setDispatchedList: (list: object[]) => set({ dispatchedList: list }),
	userInfo: {},
	setUserInfo: (info: object) => set({ userInfo: info }),
	selectedRowsList: [],
	setSelectedRowsList: (rows: object[]) => set({ selectedRowsList: rows }),
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
		PROCEDURE_ADD_NODE_DONE: 5
	}
}));

export default useStore;
