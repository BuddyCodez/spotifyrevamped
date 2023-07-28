import { create } from 'zustand';
const modalStore = create((set) => ({
    value: false,
    open: () => set({ value: true }),
    close: () => set({ value: false }),
}));
export default modalStore;