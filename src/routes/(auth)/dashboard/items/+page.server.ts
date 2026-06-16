import type { PageServerLoad } from './$types';
import { listItems } from '$lib/server/data/items.js';
import { parseItemsQuery } from '$lib/schemas/query.js';
import { requireUser } from '$lib/server/auth/guard.js';

export const load: PageServerLoad = async (event) => {
	requireUser(event);
	const query = parseItemsQuery(event.url.searchParams);

	// Streamed: skeleton renders immediately, rows resolve async
	const rowsPromise = new Promise<ReturnType<typeof listItems>>((resolve) => {
		// Simulate async data fetch; in real app this would be a DB query
		resolve(listItems(query));
	});

	return {
		query,
		streamed: {
			page: rowsPromise
		}
	};
};
