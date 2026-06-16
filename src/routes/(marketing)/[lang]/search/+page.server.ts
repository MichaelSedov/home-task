import type { PageServerLoad } from './$types';
import { searchPosts } from '$lib/server/data/posts.js';
import { parseSearchQuery } from '$lib/schemas/query.js';

// Edge runtime: low latency global search over 20 in-memory posts
export const config = { runtime: 'edge' };

export const load: PageServerLoad = ({ url, params }) => {
	const query = parseSearchQuery(url.searchParams);

	const results = searchPosts({
		q: query.q,
		tag: query.tag,
		sort: query.sort,
		order: query.order,
		lang: params.lang
	}).map((p) => ({
		id: p.id,
		slug: p.slug,
		title: p.translations[params.lang]?.title ?? p.translations['en']?.title ?? p.slug,
		excerpt: p.translations[params.lang]?.excerpt ?? p.translations['en']?.excerpt ?? '',
		tags: p.tags,
		author: p.author,
		publishedAt: p.publishedAt,
		readingTimeMinutes: p.readingTimeMinutes,
		coverColor: p.coverColor
	}));

	return { results, query };
};
