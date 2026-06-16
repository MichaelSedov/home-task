import { z } from 'zod/v4';

export const ItemStatusSchema = z.enum(['draft', 'scheduled', 'active', 'paused', 'completed', 'archived']);
export const ItemChannelSchema = z.enum(['email', 'sms', 'web', 'social', 'push']);

export const ItemOwnerSchema = z.object({
	id: z.string(),
	name: z.string()
});

export const ItemSchema = z.object({
	id: z.string(),
	name: z.string().min(1),
	status: ItemStatusSchema,
	channel: ItemChannelSchema,
	owner: ItemOwnerSchema,
	budget: z.number().nonnegative(),
	spent: z.number().nonnegative(),
	impressions: z.number().int().nonnegative(),
	clicks: z.number().int().nonnegative(),
	ctr: z.number().min(0).max(1),
	startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	updatedAt: z.iso.datetime(),
	tags: z.array(z.string())
});

export const ItemPatchSchema = z.object({
	name: z.string().min(1).optional(),
	status: ItemStatusSchema.optional()
}).refine((v) => Object.keys(v).length > 0, { message: 'Patch must have at least one field' });

export type Item = z.infer<typeof ItemSchema>;
export type ItemStatus = z.infer<typeof ItemStatusSchema>;
export type ItemChannel = z.infer<typeof ItemChannelSchema>;
export type ItemPatch = z.infer<typeof ItemPatchSchema>;
