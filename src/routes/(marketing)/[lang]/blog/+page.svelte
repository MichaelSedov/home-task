<script lang="ts">
	import { getT, getLang } from '$lib/i18n/context.js';
	import PostCard from '$lib/ui/composite/PostCard.svelte';

	let { data } = $props();
	const t = getT();
	const lang = getLang();
</script>

<svelte:head>
	<title>{t('blog.title')} — Demo Co.</title>
	<meta name="description" content="Writing and thinking from the Demo Co. team." />
	<link rel="canonical" href="{data.origin}/{lang}/blog" />
	<link rel="alternate" hreflang="en" href="{data.origin}/en/blog" />
	<link rel="alternate" hreflang="de" href="{data.origin}/de/blog" />
	<link rel="alternate" hreflang="x-default" href="{data.origin}/en/blog" />
</svelte:head>

<div class="mx-auto max-w-5xl px-6 py-14">
	<h1 class="mb-10 text-[26px] font-bold tracking-[-0.018em] text-fg">
		{t('blog.title')}
	</h1>

	{#if data.posts.length === 0}
		<p class="text-muted">{t('blog.empty')}</p>
	{:else}
		<ol class="post-grid" aria-label="Blog posts">
			{#each data.posts as post (post.id)}
				<li>
					<PostCard {post} />
				</li>
			{/each}
		</ol>
	{/if}
</div>

<style>
	.post-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 14px;
	}
</style>
