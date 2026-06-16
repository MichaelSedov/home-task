import { z } from 'zod/v4';
import { UserSchema, type User, type SessionUser } from '$lib/schemas/user.js';
import { parseOnce } from '../parse.js';
import rawUsers from '../../../../mocks/users.json' with { type: 'json' };

const users: User[] = parseOnce(z.array(UserSchema), rawUsers, 'users.json');
const byEmail = new Map(users.map((u) => [u.email, u]));

export function findByEmail(email: string): User | undefined {
	return byEmail.get(email);
}

export function verifyPassword(user: User, password: string): boolean {
	return user.password === password;
}

export function toSessionUser(user: User): SessionUser {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { password, ...rest } = user;
	return rest;
}
