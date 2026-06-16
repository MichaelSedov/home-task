import { getContext, setContext } from 'svelte';
import type { TranslateFn } from './t.js';
import type { Locale } from './dict.js';

const T_KEY = Symbol('t');
const LANG_KEY = Symbol('lang');

export function setT(t: TranslateFn) {
	setContext(T_KEY, t);
}

export function getT(): TranslateFn {
	return getContext<TranslateFn>(T_KEY);
}

export function setLang(lang: Locale) {
	setContext(LANG_KEY, lang);
}

export function getLang(): Locale {
	return getContext<Locale>(LANG_KEY);
}
