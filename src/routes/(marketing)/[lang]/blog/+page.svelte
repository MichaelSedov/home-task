<script lang="ts">
	import { getT, getLang } from '$lib/i18n/context.js';
	import { formatDate } from '$lib/i18n/t.js';
	import { getTags } from '$lib/i18n/dict.js';
	import Avatar from '$lib/ui/primitives/Avatar.svelte';
	import Badge from '$lib/ui/primitives/Badge.svelte';
	import Card from '$lib/ui/primitives/Card.svelte';

	let { data } = $props();
	const t = getT();
	const lang = getLang();
	const allTags = getTags();
</script>

<svelte:head>
	<title>{t('blog.title')} — Demo Co.</title>
	<meta name="description" content="Writing and thinking from the Demo Co. team." />
	<link rel="canonical" href="/{lang}/blog" />
	<link rel="alternate" hreflang="en" href="/en/blog" />
	<link rel="alternate" hreflang="de" href="/de/blog" />
</svelte:head>

<div class="mx-auto max-w-4xl px-6 py-16">
	<header class="mb-12">
		<h1 class="text-4xl font-extrabold text-[var(--fg)]">{t('blog.title')}</h1>
	</header>

	{#if data.posts.length === 0}
		<p class="text-[var(--muted)]">{t('blog.empty')}</p>
	{:else}
		<ol class="space-y-8" aria-label="Blog posts">
			{#each data.posts as post (post.id)}
				<li>
					<Card as="article" hover class="overflow-hidden">
						<a href="/{lang}/blog/{post.slug}" class="block p-6 focus-visible:outline-none">
							<div
								class="mb-4 h-2 w-full rounded-full"
								style="background-color: {post.coverColor}"
								aria-hidden="true"
							></div>

							<div class="flex flex-wrap gap-2 mb-3">
								{#each post.tags as tag (tag)}
									{@const tagDef = allTags.find((t2) => t2.slug === tag)}
									<Badge variant="muted">{tagDef?.label[lang] ?? tag}</Badge>
								{/each}
							</div>

							<h2 class="mb-2 text-xl font-bold text-[var(--fg)] group-hover:text-[var(--accent)]">
								{post.title}
							</h2>
							<p class="mb-4 line-clamp-2 text-sm text-[var(--muted)]">{post.excerpt}</p>

							<div class="flex items-center justify-between text-xs text-[var(--muted)]">
								<div class="flex items-center gap-2">
									<Avatar name={post.author.name} color={post.author.avatarColor} size="sm" />
									<span>{post.author.name}</span>
								</div>
								<div class="flex items-center gap-3">
									<time datetime={post.publishedAt}>{formatDate(post.publishedAt, lang)}</time>
									<span>{t('blog.readingTime', { minutes: String(post.readingTimeMinutes) })}</span>
								</div>
							</div>

							<span
								class="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)]"
							>
								{t('blog.readMore')} →
							</span>
						</a>
					</Card>
				</li>
			{/each}
		</ol>
	{/if}
</div>
