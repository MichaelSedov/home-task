import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { ItemPatchSchema } from '$lib/schemas/item.js';
import { patchItem } from '$lib/server/data/items.js';
import { requireUser } from '$lib/server/auth/guard.js';

export const PATCH: RequestHandler = async (event) => {
	requireUser(event, ['admin', 'editor']);

	let body: unknown;
	try {
		body = await event.request.json();
	} catch {
		error(400, 'Invalid JSON');
	}

	const parsed = ItemPatchSchema.safeParse(body);
	if (!parsed.success) {
		error(400, 'Invalid patch');
	}

	const updated = patchItem(event.params.id, parsed.data);
	if (!updated) error(404, 'Item not found');

	return json(updated);
};
