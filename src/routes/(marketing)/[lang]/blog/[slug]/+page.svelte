<script lang="ts">
	import { getT, getLang } from '$lib/i18n/context.js';
	import { formatDate } from '$lib/i18n/t.js';
	import { getTags } from '$lib/i18n/dict.js';
	import Avatar from '$lib/ui/primitives/Avatar.svelte';
	import Badge from '$lib/ui/primitives/Badge.svelte';

	let { data } = $props();
	const t = getT();
	const lang = getLang();
	const post = $derived(data.post);
	const jsonLdTag = $derived(`<script type="application/ld+json">${data.jsonLd}<` + `/script>`);
	const allTags = getTags();

	// Minimal markdown → HTML: bold, italic, paragraphs, line breaks
	function renderBody(text: string): string {
		return text
			.split('\n\n')
			.map(
				(p) =>
					`<p>${p
						.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
						.replace(/\*(.+?)\*/g, '<em>$1</em>')
						.replace(/\n/g, '<br />')}</p>`
			)
			.join('');
	}
</script>

<svelte:head>
	<title>{post.title} — Demo Co.</title>
	<meta name="description" content={post.excerpt} />
	<link rel="canonical" href="/{lang}/blog/{post.slug}" />
	<meta property="og:title" content={post.title} />
	<meta property="og:description" content={post.excerpt} />
	<meta property="og:type" content="article" />
	<meta property="og:image" content={data.ogImage} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content={data.ogImage} />
	<link rel="alternate" hreflang="en" href="/en/blog/{post.slug}" />
	<link rel="alternate" hreflang="de" href="/de/blog/{post.slug}" />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html jsonLdTag}
</svelte:head>

<article class="mx-auto max-w-2xl px-6 py-16" aria-labelledby="post-title">
	<!-- Cover color bar -->
	<div
		class="mb-8 h-3 w-full rounded-full"
		style="background-color: {post.coverColor}"
		aria-hidden="true"
	></div>

	<!-- Tags -->
	<nav aria-label="Post tags" class="mb-4 flex flex-wrap gap-2">
		{#each post.tags as tag (tag)}
			{@const tagDef = allTags.find((t2) => t2.slug === tag)}
			<a href="/{lang}/search?tag={tag}">
				<Badge variant="muted">{tagDef?.label[lang] ?? tag}</Badge>
			</a>
		{/each}
	</nav>

	<h1 id="post-title" class="mb-4 text-4xl font-extrabold leading-tight text-[var(--fg)]">
		{post.title}
	</h1>

	<!-- Byline -->
	<div class="mb-8 flex items-center gap-3 text-sm text-[var(--muted)]">
		<Avatar name={post.author.name} color={post.author.avatarColor} size="md" />
		<div>
			<p class="font-medium text-[var(--fg-2)]">{post.author.name}</p>
			<p>
				<time datetime={post.publishedAt}>{formatDate(post.publishedAt, lang)}</time>
				·
				{t('blog.readingTime', { minutes: String(post.readingTimeMinutes) })}
			</p>
		</div>
	</div>

	<!-- Body -->
	<div
		class="prose max-w-none text-[var(--fg-2)] [&_p]:mb-4 [&_p]:leading-relaxed [&_strong]:font-semibold [&_strong]:text-[var(--fg)] [&_em]:italic"
	>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html renderBody(post.body)}
	</div>

	<!-- Back link -->
	<nav aria-label="Post navigation" class="mt-12 border-t border-[var(--border)] pt-6">
		<a href="/{lang}/blog" class="text-sm font-medium text-[var(--accent)] hover:underline">
			← Back to blog
		</a>
	</nav>
</article>
