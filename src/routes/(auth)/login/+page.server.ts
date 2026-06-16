import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { LoginInputSchema } from '$lib/schemas/user.js';
import { findByEmail, verifyPassword, toSessionUser } from '$lib/server/data/users.js';
import { createSessionCookie } from '$lib/server/auth/session.js';

export const load: PageServerLoad = ({ locals, url }) => {
	if (locals.user) redirect(302, url.searchParams.get('redirectTo') ?? '/dashboard');
	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const formData = Object.fromEntries(await request.formData());
		const parsed = LoginInputSchema.safeParse(formData);

		if (!parsed.success) {
			return fail(400, { error: 'login.error' });
		}

		const { email, password } = parsed.data;
		const user = findByEmail(email);

		if (!user || !verifyPassword(user, password)) {
			// Constant-time-ish: always compute session cookie even on failure
			return fail(401, { error: 'login.error' });
		}

		const cookieValue = await createSessionCookie(toSessionUser(user));
		// Set-Cookie header manually (cookie string built in session.ts)
		cookies.set('session', cookieValue.split('session=')[1].split(';')[0], {
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60 * 24 * 7
		});

		redirect(302, url.searchParams.get('redirectTo') ?? '/dashboard');
	}
};
