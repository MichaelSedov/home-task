import { redirect, error } from '@sveltejs/kit';
import type { UserRole, SessionUser } from '$lib/schemas/user.js';
import type { RequestEvent } from '@sveltejs/kit';

export function requireUser(
	event: RequestEvent,
	roles?: UserRole[]
): SessionUser {
	const user = event.locals.user;
	if (!user) {
		const redirectTo = event.url.pathname + event.url.search;
		redirect(302, `/login?redirectTo=${encodeURIComponent(redirectTo)}`);
	}
	if (roles && !roles.includes(user.role)) {
		error(403, 'Forbidden');
	}
	return user;
}
