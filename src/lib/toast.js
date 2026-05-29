import { writable } from 'svelte/store';

export const toast = writable({ show: false, message: '', type: 'success' });

export function showToast(message = '', type = '', duration = 3000) {
	toast.set({ show: true, message, type });
	setTimeout(() => {
		toast.set({ show: false, message: '', type });
	}, duration);
}
