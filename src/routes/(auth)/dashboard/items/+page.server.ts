import type { PageServerLoad } from './$types';
import { listItems } from '$lib/server/data/items.js';
import { parseItemsQuery } from '$lib/schemas/query.js';
import { requireUser } from '$lib/server/auth/guard.js';

export const load: PageServerLoad = async (event) => {
	requireUser(event);

	// Tag this loader so PATCH /api/items/[id] can invalidate it on success.
	event.depends('items:list');

	const query = parseItemsQuery(event.url.searchParams);

	// Streamed: skeleton renders immediately, rows resolve async.
	const rowsPromise = new Promise<ReturnType<typeof listItems>>((resolve) => {
		resolve(listItems(query));
	});

	return {
		query,
		streamed: {
			page: rowsPromise
		}
	};
};
