export type TranslateFn = (key: string, vars?: Record<string, string | number>) => string;

export function makeT(dict: Record<string, string>): TranslateFn {
	return function t(key, vars) {
		const template = dict[key];
		if (template === undefined) {
			if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
				console.warn(`[i18n] missing key: "${key}"`);
			}
			return key;
		}
		if (!vars) return template;
		return template.replace(/\{(\w+)\}/g, (_, k) => {
			const v = vars[k];
			if (v === undefined) {
				if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
					console.warn(`[i18n] missing placeholder "${k}" in key "${key}"`);
				}
				return '';
			}
			return String(v);
		});
	};
}

export function formatDate(iso: string, locale: string): string {
	return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(
		new Date(iso)
	);
}

export function formatMoney(value: number, locale: string): string {
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: 'USD',
		maximumFractionDigits: 0
	}).format(value);
}

export function formatPercent(value: number, locale: string): string {
	return new Intl.NumberFormat(locale, { style: 'percent', minimumFractionDigits: 1 }).format(
		value
	);
}
