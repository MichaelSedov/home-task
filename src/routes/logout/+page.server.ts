import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';
import { deleteSessionCookie } from '$lib/server/auth/session.js';

export const actions: Actions = {
	default: ({ cookies }) => {
		deleteSessionCookie(cookies);
		redirect(302, '/login');
	}
};
