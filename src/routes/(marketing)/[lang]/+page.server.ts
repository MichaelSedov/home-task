import type { PageServerLoad } from './$types';
import { buildOrgJsonLd } from '$lib/ui/seo.js';

export const prerender = true;

export const load: PageServerLoad = ({ url }) => {
	return {
		jsonLd: buildOrgJsonLd(url.origin)
	};
};
