import { z } from 'zod/v4';
import { ItemSchema, type Item, type ItemPatch, type ItemStatus, type ItemChannel } from '$lib/schemas/item.js';
import { parseOnce } from '../parse.js';
import type { ItemsQuery } from '$lib/schemas/query.js';
import rawItems from '../../../../mocks/items.json' with { type: 'json' };

const store: Item[] = parseOnce(z.array(ItemSchema), rawItems, 'items.json');

export interface ItemsPage {
	rows: Item[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

export function listItems(query: ItemsQuery): ItemsPage {
	const { page, pageSize, sort, order, status, channel, q } = query;
	const needle = q.toLowerCase().trim();

	let rows = store.filter((item) => {
		if (status.length && !status.includes(item.status as ItemStatus)) return false;
		if (channel.length && !channel.includes(item.channel as ItemChannel)) return false;
		if (needle && !item.name.toLowerCase().includes(needle)) return false;
		return true;
	});

	rows.sort((a, b) => {
		let av: string | number = a[sort as keyof Item] as string | number;
		let bv: string | number = b[sort as keyof Item] as string | number;
		if (typeof av === 'string') av = av.toLowerCase();
		if (typeof bv === 'string') bv = bv.toLowerCase();
		if (av < bv) return order === 'asc' ? -1 : 1;
		if (av > bv) return order === 'asc' ? 1 : -1;
		return 0;
	});

	const total = rows.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const safePage = Math.min(page, totalPages);
	const start = (safePage - 1) * pageSize;
	const sliced = rows.slice(start, start + pageSize);

	return { rows: sliced, total, page: safePage, pageSize, totalPages };
}

export function patchItem(id: string, patch: ItemPatch): Item | null {
	const idx = store.findIndex((i) => i.id === id);
	if (idx === -1) return null;
	store[idx] = { ...store[idx], ...patch, updatedAt: new Date().toISOString() };
	return store[idx];
}
