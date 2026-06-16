import { z } from 'zod/v4';

export const TranslationSchema = z.object({
	title: z.string().min(1),
	excerpt: z.string(),
	body: z.string()
});

export const PostAuthorSchema = z.object({
	id: z.string(),
	name: z.string(),
	avatarColor: z.string()
});

export const PostSchema = z.object({
	id: z.string(),
	slug: z.string().min(1),
	translations: z.record(z.string(), TranslationSchema),
	tags: z.array(z.string()),
	author: PostAuthorSchema,
	publishedAt: z.iso.datetime(),
	readingTimeMinutes: z.number().int().positive(),
	coverColor: z.string()
});

export type Post = z.infer<typeof PostSchema>;
export type PostAuthor = z.infer<typeof PostAuthorSchema>;
export type Translation = z.infer<typeof TranslationSchema>;
