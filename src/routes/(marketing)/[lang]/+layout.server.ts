import type { LayoutServerLoad } from './$types';
import { loadDict, isLocale } from '$lib/i18n/dict.js';
import { error } from '@sveltejs/kit';

export const prerender = true;

export const load: LayoutServerLoad = ({ params, locals }) => {
	if (!isLocale(params.lang)) error(404, 'Not found');
	// Override locals.lang with URL segment
	locals.lang = params.lang;
	const dict = loadDict(params.lang);
	return { lang: params.lang, theme: locals.theme, dict, user: locals.user };
};
