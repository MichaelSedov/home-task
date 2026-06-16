import { z } from 'zod/v4';
import { PostSchema, type Post } from '$lib/schemas/post.js';
import { parseOnce } from '../parse.js';
import rawPosts from '../../../../mocks/posts.json' with { type: 'json' };

const posts: Post[] = parseOnce(z.array(PostSchema), rawPosts, 'posts.json');
const bySlug = new Map(posts.map((p) => [p.slug, p]));

export function getPosts(): Post[] {
	return posts;
}

export function getPost(slug: string): Post | undefined {
	return bySlug.get(slug);
}

export interface SearchOptions {
	q?: string;
	tag?: string;
	sort?: 'publishedAt' | 'readingTimeMinutes';
	order?: 'asc' | 'desc';
	lang?: string;
}

export function searchPosts(opts: SearchOptions): Post[] {
	const { q = '', tag = '', sort = 'publishedAt', order = 'desc', lang = 'en' } = opts;
	const needle = q.toLowerCase().trim();

	let result = posts.filter((p) => {
		if (tag && !p.tags.includes(tag)) return false;
		if (needle) {
			const t = p.translations[lang] ?? p.translations['en'];
			if (!t) return false;
			return (
				t.title.toLowerCase().includes(needle) ||
				t.excerpt.toLowerCase().includes(needle) ||
				t.body.toLowerCase().includes(needle)
			);
		}
		return true;
	});

	result.sort((a, b) => {
		const av = sort === 'publishedAt' ? new Date(a.publishedAt).getTime() : a.readingTimeMinutes;
		const bv = sort === 'publishedAt' ? new Date(b.publishedAt).getTime() : b.readingTimeMinutes;
		return order === 'asc' ? av - bv : bv - av;
	});

	return result;
}
