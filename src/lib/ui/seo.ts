export interface SeoProps {
	title: string;
	description?: string;
	canonical?: string;
	og?: {
		image?: string;
		type?: 'website' | 'article';
	};
	lang?: string;
	alternates?: { lang: string; href: string }[];
}

export function buildSeoHead(props: SeoProps) {
	return props;
}

export function buildArticleJsonLd(opts: {
	title: string;
	description: string;
	url: string;
	publishedAt: string;
	author: string;
	image?: string;
}) {
	return JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: opts.title,
		description: opts.description,
		datePublished: opts.publishedAt,
		author: { '@type': 'Person', name: opts.author },
		url: opts.url,
		...(opts.image ? { image: opts.image } : {}),
		breadcrumb: {
			'@type': 'BreadcrumbList',
			itemListElement: [
				{ '@type': 'ListItem', position: 1, name: 'Home', item: opts.url.split('/blog')[0] },
				{
					'@type': 'ListItem',
					position: 2,
					name: 'Blog',
					item: `${opts.url.split('/blog')[0]}/blog`
				},
				{ '@type': 'ListItem', position: 3, name: opts.title, item: opts.url }
			]
		}
	});
}

export function buildOrgJsonLd(url: string) {
	return JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'Demo Co.',
		url,
		description: 'A performance-first stack for teams that ship.'
	});
}
