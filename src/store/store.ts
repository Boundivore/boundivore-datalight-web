// store.ts
import { create } from 'zustand';

const useStore = create(set => ({
	selectedRows: [],
	setSelectedRows: rows => set({ selectedRows: rows })
}));

export default useStore;
