import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { get } from 'svelte/store';

// Import fresh store per test by re-importing the module
async function freshStore() {
	vi.resetModules();
	const { toasts } = await import('$lib/ui/toast.store.js');
	return toasts;
}

describe('toast store', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('starts empty', async () => {
		const toasts = await freshStore();
		expect(get(toasts)).toHaveLength(0);
	});

	it('adds a toast with the correct variant', async () => {
		const toasts = await freshStore();
		toasts.error('Something broke');
		const items = get(toasts);
		expect(items).toHaveLength(1);
		expect(items[0].variant).toBe('error');
		expect(items[0].message).toBe('Something broke');
	});

	it('auto-dismisses after the default duration', async () => {
		const toasts = await freshStore();
		toasts.info('Hello');
		expect(get(toasts)).toHaveLength(1);
		vi.advanceTimersByTime(4001);
		expect(get(toasts)).toHaveLength(0);
	});

	it('does not dismiss before the duration elapses', async () => {
		const toasts = await freshStore();
		toasts.success('Done');
		vi.advanceTimersByTime(3999);
		expect(get(toasts)).toHaveLength(1);
	});

	it('removes a toast by id', async () => {
		const toasts = await freshStore();
		const id = toasts.add('Removable', 'info', 10_000);
		expect(get(toasts)).toHaveLength(1);
		toasts.remove(id);
		expect(get(toasts)).toHaveLength(0);
	});

	it('stacks multiple toasts', async () => {
		const toasts = await freshStore();
		toasts.info('A');
		toasts.info('B');
		toasts.info('C');
		expect(get(toasts)).toHaveLength(3);
	});
});
