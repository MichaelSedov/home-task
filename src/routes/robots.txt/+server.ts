import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = ({ url }) => {
	const origin = process.env.PUBLIC_ORIGIN || url.origin;
	const body = `User-agent: *
Disallow: /dashboard
Disallow: /login
Disallow: /logout
Disallow: /api/

Sitemap: ${origin}/sitemap.xml
`;

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain' }
	});
};
