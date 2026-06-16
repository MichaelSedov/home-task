import { describe, it, expect } from 'vitest';
import { PostSchema } from '$lib/schemas/post.js';
import { ItemSchema, ItemPatchSchema } from '$lib/schemas/item.js';
import { UserSchema, LoginInputSchema } from '$lib/schemas/user.js';

describe('PostSchema', () => {
	const validPost = {
		id: 'post_000',
		slug: 'my-post',
		translations: {
			en: { title: 'Hello', excerpt: 'Short', body: 'Long body' }
		},
		tags: ['engineering'],
		author: { id: 'u1', name: 'Alice', avatarColor: '#abc123' },
		publishedAt: '2026-01-01T00:00:00Z',
		readingTimeMinutes: 3,
		coverColor: '#1e293b'
	};

	it('accepts a valid post', () => {
		expect(() => PostSchema.parse(validPost)).not.toThrow();
	});

	it('rejects missing slug', () => {
		const { slug: _, ...rest } = validPost;
		expect(() => PostSchema.parse(rest)).toThrow();
	});

	it('rejects empty slug', () => {
		expect(() => PostSchema.parse({ ...validPost, slug: '' })).toThrow();
	});

	it('rejects negative readingTimeMinutes', () => {
		expect(() => PostSchema.parse({ ...validPost, readingTimeMinutes: -1 })).toThrow();
	});

	it('rejects invalid publishedAt', () => {
		expect(() => PostSchema.parse({ ...validPost, publishedAt: 'not-a-date' })).toThrow();
	});
});

describe('ItemSchema', () => {
	const validItem = {
		id: 'cmp_001',
		name: 'Campaign A',
		status: 'active',
		channel: 'email',
		owner: { id: 'u1', name: 'Alice' },
		budget: 1000,
		spent: 500,
		impressions: 10000,
		clicks: 200,
		ctr: 0.02,
		startDate: '2026-01-01',
		endDate: '2026-03-01',
		updatedAt: '2026-01-15T10:00:00Z',
		tags: []
	};

	it('accepts a valid item', () => {
		expect(() => ItemSchema.parse(validItem)).not.toThrow();
	});

	it('rejects unknown status', () => {
		expect(() => ItemSchema.parse({ ...validItem, status: 'running' })).toThrow();
	});

	it('rejects CTR > 1', () => {
		expect(() => ItemSchema.parse({ ...validItem, ctr: 1.5 })).toThrow();
	});

	it('rejects negative budget', () => {
		expect(() => ItemSchema.parse({ ...validItem, budget: -100 })).toThrow();
	});
});

describe('ItemPatchSchema', () => {
	it('accepts valid status patch', () => {
		expect(() => ItemPatchSchema.parse({ status: 'paused' })).not.toThrow();
	});

	it('rejects empty object', () => {
		expect(() => ItemPatchSchema.parse({})).toThrow();
	});

	it('rejects unknown status', () => {
		expect(() => ItemPatchSchema.parse({ status: 'invalid' })).toThrow();
	});
});

describe('LoginInputSchema', () => {
	it('accepts valid credentials', () => {
		expect(() =>
			LoginInputSchema.parse({ email: 'admin@demo.test', password: 'demo1234' })
		).not.toThrow();
	});

	it('rejects invalid email', () => {
		expect(() => LoginInputSchema.parse({ email: 'notanemail', password: 'demo1234' })).toThrow();
	});

	it('rejects empty password', () => {
		expect(() => LoginInputSchema.parse({ email: 'admin@demo.test', password: '' })).toThrow();
	});
});

describe('UserSchema', () => {
	it('rejects unknown role', () => {
		expect(() =>
			UserSchema.parse({ id: 'u1', email: 'a@b.com', password: 'x', name: 'A', role: 'superadmin' })
		).toThrow();
	});
});
