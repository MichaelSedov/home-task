<script lang="ts">
	import { getLang } from '$lib/i18n/context.js';
	import Byline from '$lib/ui/composite/Byline.svelte';
	import PostTagList from '$lib/ui/composite/PostTagList.svelte';
	import { renderMarkdown } from '$lib/util/markdown.js';

	let { data } = $props();
	const lang = getLang();
	const post = $derived(data.post);
	const jsonLdTag = $derived(`<script type="application/ld+json">${data.jsonLd}<` + `/script>`);
</script>

<svelte:head>
	<title>{post.title} — Demo Co.</title>
	<meta name="description" content={post.excerpt} />
	<link rel="canonical" href="{data.origin}/{lang}/blog/{post.slug}" />
	<meta property="og:title" content={post.title} />
	<meta property="og:description" content={post.excerpt} />
	<meta property="og:type" content="article" />
	<meta property="og:url" content="{data.origin}/{lang}/blog/{post.slug}" />
	<meta property="og:image" content={data.ogImage} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content={data.ogImage} />
	<link rel="alternate" hreflang="en" href="{data.origin}/en/blog/{post.slug}" />
	<link rel="alternate" hreflang="de" href="{data.origin}/de/blog/{post.slug}" />
	<link rel="alternate" hreflang="x-default" href="{data.origin}/en/blog/{post.slug}" />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html jsonLdTag}
</svelte:head>

<article class="mx-auto max-w-2xl px-6 py-16" aria-labelledby="post-title">
	<div
		class="mb-8 h-3 w-full rounded-full"
		style="background-color: {post.coverColor}"
		aria-hidden="true"
	></div>

	<PostTagList tags={post.tags} variant="badge" />

	<h1 id="post-title" class="mb-4 text-4xl font-extrabold leading-tight text-fg">
		{post.title}
	</h1>

	<div class="mb-8">
		<Byline
			author={post.author}
			publishedAt={post.publishedAt}
			readingTimeMinutes={post.readingTimeMinutes}
			variant="stacked"
		/>
	</div>

	<div class="post-body prose max-w-none">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html renderMarkdown(post.body)}
	</div>

	<nav aria-label="Post navigation" class="mt-12 border-t border-border pt-6">
		<a href="/{lang}/blog" class="text-sm font-medium text-accent hover:underline">
			← Back to blog
		</a>
	</nav>
</article>

<style>
	.post-body {
		color: var(--fg-2);
	}
	.post-body :global(p) {
		margin-bottom: 1rem;
		line-height: 1.625;
	}
	.post-body :global(strong) {
		font-weight: 600;
		color: var(--fg);
	}
	.post-body :global(em) {
		font-style: italic;
	}
</style>
