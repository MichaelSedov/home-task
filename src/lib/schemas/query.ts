import { z } from 'zod/v4';
import { ItemStatusSchema, ItemChannelSchema } from './item.js';

export const SORT_ORDERS = ['asc', 'desc'] as const;
export const ITEMS_SORT_FIELDS = [
	'name',
	'status',
	'channel',
	'budget',
	'spent',
	'ctr',
	'updatedAt'
] as const;
export const POSTS_SORT_FIELDS = ['publishedAt', 'readingTimeMinutes'] as const;

export const ItemsQuerySchema = z.object({
	page: z.coerce.number().int().min(1).catch(1),
	pageSize: z.coerce.number().int().min(1).max(100).catch(20),
	sort: z.enum(ITEMS_SORT_FIELDS).catch('updatedAt'),
	order: z.enum(SORT_ORDERS).catch('desc'),
	status: z.array(ItemStatusSchema).catch([]),
	channel: z.array(ItemChannelSchema).catch([]),
	q: z.string().catch('')
});

export const SearchQuerySchema = z.object({
	q: z.string().catch(''),
	tag: z.string().catch(''),
	sort: z.enum(POSTS_SORT_FIELDS).catch('publishedAt'),
	order: z.enum(SORT_ORDERS).catch('desc')
});

export type ItemsQuery = z.infer<typeof ItemsQuerySchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;

export function parseItemsQuery(params: URLSearchParams): ItemsQuery {
	return ItemsQuerySchema.parse({
		page: params.get('page'),
		pageSize: params.get('pageSize'),
		sort: params.get('sort'),
		order: params.get('order'),
		status: params.getAll('status'),
		channel: params.getAll('channel'),
		q: params.get('q')
	});
}

export function parseSearchQuery(params: URLSearchParams): SearchQuery {
	return SearchQuerySchema.parse({
		q: params.get('q'),
		tag: params.get('tag'),
		sort: params.get('sort'),
		order: params.get('order')
	});
}

export function toSearchParams(
	query: Record<string, string | string[] | number | undefined>
): URLSearchParams {
	const params = new URLSearchParams();
	for (const [key, value] of Object.entries(query)) {
		if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0))
			continue;
		if (Array.isArray(value)) {
			value.forEach((v) => params.append(key, v));
		} else {
			params.set(key, String(value));
		}
	}
	return params;
}
