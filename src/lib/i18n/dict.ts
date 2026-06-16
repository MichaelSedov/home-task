import enDict from '../../../mocks/i18n.en.json' with { type: 'json' };
import deDict from '../../../mocks/i18n.de.json' with { type: 'json' };
import enTags from '../../../mocks/tags.json' with { type: 'json' };

export const SUPPORTED_LOCALES = ['en', 'de'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export function isLocale(v: unknown): v is Locale {
	return SUPPORTED_LOCALES.includes(v as Locale);
}

const dicts: Record<Locale, Record<string, string>> = {
	en: enDict as Record<string, string>,
	de: deDict as Record<string, string>
};

export function loadDict(lang: Locale): Record<string, string> {
	return dicts[lang] ?? dicts['en'];
}

export function getTagLabel(slug: string, lang: Locale): string {
	const tag = enTags.find((t) => t.slug === slug);
	if (!tag) return slug;
	return tag.label[lang] ?? slug;
}

export function getTags() {
	return enTags;
}
