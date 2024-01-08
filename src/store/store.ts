// store.ts
import { create } from 'zustand';

const useStore = create(set => ({
	parsedList: [],
	setParsedList: (list: object[]) => set({ parsedList: list }),
	detectedList: [],
	setDetectedList: (list: object[]) => set({ detectedList: list }),
	checkedList: [],
	setCheckedList: (list: object[]) => set({ checkedList: list }),
	dispatchedList: [],
	setDispatchedList: (list: object[]) => set({ dispatchedList: list }),
	selectedRows: [],
	setSelectedRows: (rows: object[]) => set({ selectedRows: rows }),
	jobClusterId: '',
	setJobClusterId: (id: string) => set({ jobClusterId: id }),
	jobNodeId: '',
	setJobNodeId: (id: string) => set({ jobNodeId: id }),
	stepCurrent: 0,
	setStepCurrent: (current: number) => set({ stepCurrent: current }),
	stepCurrentTag: null,
	setStepCurrentTag: (current: string) => set({ stepCurrentTag: current }),
	stepMap: {
		// 'PROCEDURE_PARSE_HOSTNAME': 0,
		// eslint-disable-next-line prettier/prettier
		'PROCEDURE_PARSE_HOSTNAME': 1,
		// eslint-disable-next-line prettier/prettier
		'PROCEDURE_DETECT': 2,
		// eslint-disable-next-line prettier/prettier
		'PROCEDURE_CHECK': 3,
		// eslint-disable-next-line prettier/prettier
		'PROCEDURE_DISPATCH': 4,
		// eslint-disable-next-line prettier/prettier
		'PROCEDURE_ADD_DONE': 5
	}
}));

export default useStore;
