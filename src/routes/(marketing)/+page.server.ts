import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { isLocale } from '$lib/i18n/dict.js';

// Root / — redirect to /en or /de based on lang detected in hooks
export const load: PageServerLoad = ({ locals }) => {
	const lang = isLocale(locals.lang) ? locals.lang : 'en';
	redirect(302, `/${lang}`);
};
