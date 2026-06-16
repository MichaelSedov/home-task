import type { PageServerLoad } from './$types';
import { getPosts } from '$lib/server/data/posts.js';

export const prerender = true;

export const load: PageServerLoad = ({ params }) => {
	const posts = getPosts()
		.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
		.map((p) => ({
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

	return { posts };
};
