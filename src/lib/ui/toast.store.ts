import { writable } from 'svelte/store';

export type ToastVariant = 'info' | 'success' | 'error';

export interface Toast {
	id: string;
	message: string;
	variant: ToastVariant;
}

function createToastStore() {
	const { subscribe, update } = writable<Toast[]>([]);

	function add(message: string, variant: ToastVariant = 'info', durationMs = 4000) {
		const id = crypto.randomUUID();
		update((ts) => [...ts, { id, message, variant }]);
		setTimeout(() => remove(id), durationMs);
		return id;
	}

	function remove(id: string) {
		update((ts) => ts.filter((t) => t.id !== id));
	}

	return {
		subscribe,
		add,
		remove,
		info: (m: string) => add(m, 'info'),
		success: (m: string) => add(m, 'success'),
		error: (m: string) => add(m, 'error')
	};
}

export const toasts = createToastStore();
