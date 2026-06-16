import type { Actions } from './$types';
import { redirect } from '@sveltejs/kit';

export const actions: Actions = {
	default: ({ cookies }) => {
		cookies.delete('session', { path: '/' });
		redirect(302, '/login');
	}
};
