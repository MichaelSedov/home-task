import { describe, it, expect } from 'vitest';
import { formatMoney, formatDate, formatPercent, makeT } from '$lib/i18n/t.js';

describe('formatMoney', () => {
	it('formats USD for en locale', () => {
		expect(formatMoney(1500, 'en')).toMatch(/\$1,500/);
	});

	it('formats USD for de locale', () => {
		const result = formatMoney(1500, 'de');
		// German format: 1.500 $ or 1.500 US$
		expect(result).toMatch(/1[.\s,]?500/);
	});

	it('rounds to 0 decimal places', () => {
		expect(formatMoney(1500.99, 'en')).not.toContain('.');
	});
});

describe('formatDate', () => {
	it('formats ISO date for en locale', () => {
		const result = formatDate('2026-05-31T00:00:00Z', 'en');
		expect(result).toContain('2026');
		expect(result.toLowerCase()).toMatch(/may|may/i);
	});

	it('formats ISO date for de locale', () => {
		const result = formatDate('2026-05-31T00:00:00Z', 'de');
		expect(result).toContain('2026');
		expect(result.toLowerCase()).toMatch(/mai/i);
	});
});

describe('formatPercent', () => {
	it('formats 0.0537 as roughly 5.4%', () => {
		const result = formatPercent(0.0537, 'en');
		expect(result).toContain('5.4%');
	});
});

describe('makeT', () => {
	const dict = {
		hello: 'Hello!',
		greeting: 'Hello, {name}!',
		count: '{count} items'
	};
	const t = makeT(dict);

	it('returns the value for a known key', () => {
		expect(t('hello')).toBe('Hello!');
	});

	it('returns the key itself for an unknown key', () => {
		expect(t('missing.key')).toBe('missing.key');
	});

	it('interpolates a single placeholder', () => {
		expect(t('greeting', { name: 'Alice' })).toBe('Hello, Alice!');
	});

	it('interpolates a numeric placeholder', () => {
		expect(t('count', { count: 42 })).toBe('42 items');
	});

	it('replaces missing placeholder with empty string', () => {
		expect(t('greeting', {})).toBe('Hello, !');
	});
});
