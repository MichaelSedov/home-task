import type { PageServerLoad } from './$types';
import { buildOrgJsonLd } from '$lib/ui/seo.js';

export const prerender = true;

export const load: PageServerLoad = ({ url }) => {
	const origin = process.env.PUBLIC_ORIGIN || url.origin;
	return {
		jsonLd: buildOrgJsonLd(origin)
	};
};
