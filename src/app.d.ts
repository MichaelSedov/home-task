import type { SessionUser } from '$lib/schemas/user.js';
import type { Locale } from '$lib/i18n/dict.js';

declare global {
	namespace App {
		interface Locals {
			user: SessionUser | null;
			lang: Locale;
			theme: 'light' | 'dark';
		}
		interface PageData {
			lang: Locale;
			theme: 'light' | 'dark';
		}
		interface Error {
			message: string;
			code?: string;
		}
	}
}

export {};
