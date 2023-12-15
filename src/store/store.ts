// store.ts
import { create } from 'zustand';

const useStore = create(set => ({
	parsedList: [],
	setParsedList: list => set({ parsedList: list }),
	detectedList: [],
	setDetectedList: list => set({ detectedList: list }),
	selectedRows: [],
	setSelectedRows: rows => set({ selectedRows: rows })
}));

export default useStore;
