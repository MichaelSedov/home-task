import { z } from 'zod/v4';

export function parseOnce<T>(schema: z.ZodType<T>, raw: unknown, label: string): T {
	const result = schema.safeParse(raw);
	if (!result.success) {
		throw new Error(`[parse] ${label} failed validation:\n${z.prettifyError(result.error)}`);
	}
	return result.data;
}
