import { describe, it, expect } from 'vitest';
import { searchPosts, getPosts } from '$lib/server/data/posts.js';
import { listItems, patchItem } from '$lib/server/data/items.js';
import { parseItemsQuery } from '$lib/schemas/query.js';

describe('searchPosts', () => {
	it('returns all posts when no filters', () => {
		const all = getPosts();
		const result = searchPosts({});
		expect(result).toHaveLength(all.length);
	});

	it('filters by tag', () => {
		const result = searchPosts({ tag: 'design' });
		expect(result.length).toBeGreaterThan(0);
		expect(result.every((p) => p.tags.includes('design'))).toBe(true);
	});

	it('returns empty for non-existent tag', () => {
		expect(searchPosts({ tag: '__nonexistent_tag__' })).toHaveLength(0);
	});

	it('filters by text query (case-insensitive)', () => {
		const result = searchPosts({ q: 'LCP', lang: 'en' });
		expect(result.length).toBeGreaterThan(0);
	});

	it('sorts by publishedAt descending by default', () => {
		const result = searchPosts({});
		const dates = result.map((p) => new Date(p.publishedAt).getTime());
		for (let i = 1; i < dates.length; i++) {
			expect(dates[i]).toBeLessThanOrEqual(dates[i - 1]);
		}
	});

	it('sorts by publishedAt ascending', () => {
		const result = searchPosts({ sort: 'publishedAt', order: 'asc' });
		const dates = result.map((p) => new Date(p.publishedAt).getTime());
		for (let i = 1; i < dates.length; i++) {
			expect(dates[i]).toBeGreaterThanOrEqual(dates[i - 1]);
		}
	});
});

describe('listItems', () => {
	const defaultQ = parseItemsQuery(new URLSearchParams());

	it('returns correct total count', () => {
		const result = listItems(defaultQ);
		expect(result.total).toBe(220);
	});

	it('paginates correctly', () => {
		const result = listItems(defaultQ);
		expect(result.rows).toHaveLength(defaultQ.pageSize);
		expect(result.totalPages).toBe(Math.ceil(220 / defaultQ.pageSize));
	});

	it('filters by status', () => {
		const q = parseItemsQuery(new URLSearchParams('status=active'));
		const result = listItems(q);
		expect(result.rows.every((r) => r.status === 'active')).toBe(true);
	});

	it('clamps out-of-range page to last page', () => {
		const q = parseItemsQuery(new URLSearchParams('page=9999'));
		const result = listItems(q);
		expect(result.page).toBe(result.totalPages);
	});

	it('sorts by budget descending', () => {
		const q = parseItemsQuery(new URLSearchParams('sort=budget&order=desc&pageSize=100'));
		const result = listItems(q);
		const budgets = result.rows.map((r) => r.budget);
		for (let i = 1; i < budgets.length; i++) {
			expect(budgets[i]).toBeLessThanOrEqual(budgets[i - 1]);
		}
	});
});

describe('patchItem', () => {
	it('patches an existing item status', () => {
		const items = listItems(parseItemsQuery(new URLSearchParams())).rows;
		const target = items[0];
		const newStatus = target.status === 'active' ? 'paused' : 'active';
		const updated = patchItem(target.id, { status: newStatus });
		expect(updated?.status).toBe(newStatus);
	});

	it('returns null for unknown id', () => {
		expect(patchItem('nonexistent', { status: 'active' })).toBeNull();
	});
});
