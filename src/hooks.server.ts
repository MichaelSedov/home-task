import type { Handle } from '@sveltejs/kit';
import { readSession } from '$lib/server/auth/session.js';
import { isLocale } from '$lib/i18n/dict.js';
import type { Locale } from '$lib/i18n/dict.js';

function detectLang(request: Request, cookieHeader: string | null): Locale {
	// 1. lang cookie
	const cookieLang = cookieHeader?.match(/(?:^|;\s*)lang=([^;]+)/)?.[1];
	if (isLocale(cookieLang)) return cookieLang;

	// 2. Accept-Language header
	const accept = request.headers.get('accept-language') ?? '';
	for (const part of accept.split(',')) {
		const code = part.split(';')[0].trim().slice(0, 2).toLowerCase();
		if (isLocale(code)) return code;
	}

	return 'en';
}

export const handle: Handle = async ({ event, resolve }) => {
	const cookieHeader = event.request.headers.get('cookie');

	// session — use event.cookies.get so SvelteKit handles URL-decoding
	event.locals.user = await readSession(event.cookies);

	// theme
	const themeCookie = event.cookies.get('theme');
	event.locals.theme = themeCookie === 'dark' ? 'dark' : 'light';

	// lang — overridden by URL segment in route layouts
	event.locals.lang = detectLang(event.request, cookieHeader);

	const response = await resolve(event, {
		transformPageChunk({ html }) {
			return html
				.replace('data-theme="light"', `data-theme="${event.locals.theme}"`)
				.replace('lang="en"', `lang="${event.locals.lang}"`);
		}
	});

	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set(
		'Content-Security-Policy',
		[
			"default-src 'self'",
			"script-src 'self' 'unsafe-inline'",
			"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
			"font-src 'self' https://fonts.gstatic.com",
			"img-src 'self' data:",
			"connect-src 'self'"
		].join('; ')
	);

	return response;
};
