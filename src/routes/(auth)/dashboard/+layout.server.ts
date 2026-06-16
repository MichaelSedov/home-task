import type { LayoutServerLoad } from './$types';
import { requireUser } from '$lib/server/auth/guard.js';
import { loadDict } from '$lib/i18n/dict.js';

export const load: LayoutServerLoad = (event) => {
	const user = requireUser(event);
	const dict = loadDict(event.locals.lang);
	return { user, lang: event.locals.lang, theme: event.locals.theme, dict };
};
