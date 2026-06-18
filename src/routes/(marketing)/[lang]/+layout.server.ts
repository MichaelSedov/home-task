import type { LayoutServerLoad } from './$types';
import { isLocale } from '$lib/i18n/dict.js';
import { error } from '@sveltejs/kit';

export const prerender = true;

// Validates the locale segment. Dict/lang/user already flow from the parent
// (marketing) layout, which reads them from the URL — no duplication here.
export const load: LayoutServerLoad = ({ params }) => {
	if (!isLocale(params.lang)) error(404, 'Not found');
	return {};
};
