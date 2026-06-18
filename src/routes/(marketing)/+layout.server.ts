import type { LayoutServerLoad } from './$types';
import { loadDict, isLocale } from '$lib/i18n/dict.js';

// The `[lang]` segment owns the locale; the root marketing layout reads it
// from the URL so the nav/footer/lang-switcher pick the right dictionary
// immediately — without depending on the child layout's data.
export const load: LayoutServerLoad = ({ url, locals }) => {
	const segment = url.pathname.split('/')[1];
	const lang = isLocale(segment) ? segment : locals.lang;
	const dict = loadDict(lang);
	return { lang, theme: locals.theme, dict, user: locals.user };
};
