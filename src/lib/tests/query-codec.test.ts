import { describe, it, expect } from 'vitest';
import { parseItemsQuery, parseSearchQuery, toSearchParams } from '$lib/schemas/query.js';

describe('parseItemsQuery', () => {
	it('returns defaults for empty params', () => {
		const result = parseItemsQuery(new URLSearchParams());
		expect(result).toMatchObject({
			page: 1,
			pageSize: 20,
			sort: 'updatedAt',
			order: 'desc',
			status: [],
			channel: [],
			q: ''
		});
	});

	it('clamps invalid page to 1', () => {
		expect(parseItemsQuery(new URLSearchParams('page=-5')).page).toBe(1);
		expect(parseItemsQuery(new URLSearchParams('page=abc')).page).toBe(1);
	});

	it('falls back on unknown sort field', () => {
		expect(parseItemsQuery(new URLSearchParams('sort=nonexistent')).sort).toBe('updatedAt');
	});

	it('parses multi-value status correctly', () => {
		const p = new URLSearchParams();
		p.append('status', 'active');
		p.append('status', 'paused');
		expect(parseItemsQuery(p).status).toEqual(['active', 'paused']);
	});

	it('round-trips through toSearchParams', () => {
		const original = parseItemsQuery(
			new URLSearchParams('page=3&sort=budget&order=asc&status=active&channel=email&q=test')
		);
		const params = toSearchParams({
			page: String(original.page),
			sort: original.sort,
			order: original.order,
			status: original.status,
			channel: original.channel,
			q: original.q
		});
		const reparsed = parseItemsQuery(params);
		expect(reparsed).toEqual(original);
	});
});

describe('parseSearchQuery', () => {
	it('returns defaults for empty params', () => {
		expect(parseSearchQuery(new URLSearchParams())).toMatchObject({
			q: '',
			tag: '',
			sort: 'publishedAt',
			order: 'desc'
		});
	});

	it('preserves valid query values', () => {
		const result = parseSearchQuery(
			new URLSearchParams('q=svelte&tag=engineering&sort=readingTimeMinutes&order=asc')
		);
		expect(result).toMatchObject({
			q: 'svelte',
			tag: 'engineering',
			sort: 'readingTimeMinutes',
			order: 'asc'
		});
	});
});

describe('toSearchParams', () => {
	it('omits undefined and empty values', () => {
		const p = toSearchParams({ page: undefined, q: '', sort: 'name' });
		expect(p.toString()).toBe('sort=name');
	});

	it('serialises arrays as repeated keys', () => {
		const p = toSearchParams({ status: ['active', 'paused'] });
		expect(p.getAll('status')).toEqual(['active', 'paused']);
	});
});
