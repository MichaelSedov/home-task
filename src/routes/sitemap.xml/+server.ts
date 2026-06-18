import type { RequestHandler } from './$types';
import { getPosts } from '$lib/server/data/posts.js';
import { SUPPORTED_LOCALES } from '$lib/i18n/dict.js';

export const prerender = true;

export const GET: RequestHandler = ({ url }) => {
	const origin = process.env.PUBLIC_ORIGIN || url.origin;
	const posts = getPosts();

	const staticRoutes = SUPPORTED_LOCALES.flatMap((lang) => [
		`<url><loc>${origin}/${lang}</loc><changefreq>monthly</changefreq><priority>1.0</priority><xhtml:link rel="alternate" hreflang="en" href="${origin}/en"/><xhtml:link rel="alternate" hreflang="de" href="${origin}/de"/></url>`,
		`<url><loc>${origin}/${lang}/blog</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`
	]);

	const postRoutes = SUPPORTED_LOCALES.flatMap((lang) =>
		posts.map(
			(p) =>
				`<url><loc>${origin}/${lang}/blog/${p.slug}</loc><lastmod>${p.publishedAt.slice(0, 10)}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority><xhtml:link rel="alternate" hreflang="en" href="${origin}/en/blog/${p.slug}"/><xhtml:link rel="alternate" hreflang="de" href="${origin}/de/blog/${p.slug}"/></url>`
		)
	);

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${[...staticRoutes, ...postRoutes].join('\n')}
</urlset>`;

	return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
