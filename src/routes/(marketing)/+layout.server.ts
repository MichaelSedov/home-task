import type { LayoutServerLoad } from './$types';
import { loadDict } from '$lib/i18n/dict.js';

export const load: LayoutServerLoad = ({ locals }) => {
	const dict = loadDict(locals.lang);
	return { lang: locals.lang, theme: locals.theme, dict, user: locals.user };
};
