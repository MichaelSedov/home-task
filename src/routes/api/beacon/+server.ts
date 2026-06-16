import type { RequestHandler } from './$types';

export const config = { runtime: 'edge' };

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		console.log('[beacon]', JSON.stringify(body));
	} catch {
		// malformed body — drop silently
	}
	return new Response(null, { status: 204 });
};
