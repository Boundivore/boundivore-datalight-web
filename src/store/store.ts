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
	selectedRowsList: [],
	setSelectedRowsList: (rows: object[]) => set({ selectedRowsList: rows }),
	jobClusterId: '',
	setJobClusterId: (id: string) => set({ jobClusterId: id }),
	jobNodeId: '',
	setJobNodeId: (id: string) => set({ jobNodeId: id }),
	stepCurrent: 0,
	setStepCurrent: (current: number) => set({ stepCurrent: current }),
	stepMap: {
		// eslint-disable-next-line prettier/prettier
		'PROCEDURE_BEFORE_PARSE': 0,
		// eslint-disable-next-line prettier/prettier
		'PROCEDURE_PARSE_HOSTNAME': 1,
		// eslint-disable-next-line prettier/prettier
		'PROCEDURE_DETECT': 2,
		// eslint-disable-next-line prettier/prettier
		'PROCEDURE_CHECK': 3,
		// eslint-disable-next-line prettier/prettier
		'PROCEDURE_DISPATCH': 4,
		// eslint-disable-next-line prettier/prettier
		'PROCEDURE_ADD_NODE_DONE': 5
	}
}));

export default useStore;
