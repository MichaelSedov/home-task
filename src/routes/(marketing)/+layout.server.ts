import type { LayoutServerLoad } from './$types';
import { loadDict, isLocale } from '$lib/i18n/dict.js';

// The `[lang]` segment owns the locale; the root marketing layout reads it
// from the URL so the nav/footer/lang-switcher pick the right dictionary
// immediately — without depending on the child layout's data.
export const load: LayoutServerLoad = ({ url, locals }) => {
	const segment = url.pathname.split('/')[1];
	const lang = isLocale(segment) ? segment : locals.lang;
	const dict = loadDict(lang);

	// Origin must be absolute for canonical / hreflang (Lighthouse SEO rejects
	// relative ones). At prerender time SvelteKit hands us a placeholder origin
	// (`http://sveltekit-prerender`); on Vercel we substitute PUBLIC_ORIGIN
	// so the baked-in URLs match production. Falls back to url.origin at runtime.
	const origin = process.env.PUBLIC_ORIGIN || url.origin;

	return { lang, theme: locals.theme, dict, user: locals.user, origin };
};
