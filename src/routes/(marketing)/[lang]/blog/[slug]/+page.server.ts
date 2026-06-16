import type { PageServerLoad, EntryGenerator } from './$types';
import { getPosts, getPost } from '$lib/server/data/posts.js';
import { buildArticleJsonLd } from '$lib/ui/seo.js';
import { error } from '@sveltejs/kit';
import { SUPPORTED_LOCALES } from '$lib/i18n/dict.js';

export const prerender = true;

export const entries: EntryGenerator = () => {
	const posts = getPosts();
	return SUPPORTED_LOCALES.flatMap((lang) => posts.map((p) => ({ lang, slug: p.slug })));
};

export const load: PageServerLoad = ({ params, url }) => {
	const post = getPost(params.slug);
	if (!post) error(404, 'Post not found');

	const translation = post.translations[params.lang] ?? post.translations['en'];
	if (!translation) error(404, 'Post not found');

	const jsonLd = buildArticleJsonLd({
		title: translation.title,
		description: translation.excerpt,
		url: url.href,
		publishedAt: post.publishedAt,
		author: post.author.name,
		image: `${url.origin}/og/${post.slug}.png`
	});

	return {
		post: {
			...post,
			title: translation.title,
			excerpt: translation.excerpt,
			body: translation.body
		},
		jsonLd,
		ogImage: `${url.origin}/og/${post.slug}.png`
	};
};
