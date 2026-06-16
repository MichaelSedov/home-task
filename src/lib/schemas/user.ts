import { z } from 'zod/v4';

export const UserRoleSchema = z.enum(['admin', 'editor', 'viewer']);

export const UserSchema = z.object({
	id: z.string(),
	email: z.email(),
	password: z.string(),
	name: z.string(),
	role: UserRoleSchema
});

export const LoginInputSchema = z.object({
	email: z.email({ error: 'login.error' }),
	password: z.string().min(1, { error: 'login.error' })
});

export type User = z.infer<typeof UserSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type LoginInput = z.infer<typeof LoginInputSchema>;

export type SessionUser = Omit<User, 'password'>;
