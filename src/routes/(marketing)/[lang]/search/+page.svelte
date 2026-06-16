<script lang="ts">
	import { getT, getLang } from '$lib/i18n/context.js';
	import { getTags } from '$lib/i18n/dict.js';
	import { formatDate } from '$lib/i18n/t.js';
	import { goto } from '$app/navigation';
	import Avatar from '$lib/ui/primitives/Avatar.svelte';
	import Badge from '$lib/ui/primitives/Badge.svelte';
	import Card from '$lib/ui/primitives/Card.svelte';
	import Combobox from '$lib/ui/composite/Combobox.svelte';

	let { data } = $props();
	const t = getT();
	const lang = getLang();
	const allTags = getTags();

	// Initialize from URL; updated by user interaction, not reactively re-synced on nav
	let q = $state(data.query.q);
	let selectedTags = $state<string[]>(data.query.tag ? [data.query.tag] : []);

	const tagOptions = $derived(
		allTags.map((tag) => ({ value: tag.slug, label: tag.label[lang] ?? tag.slug }))
	);

	function applyFilters() {
		const p = new URLSearchParams();
		if (q) p.set('q', q);
		if (selectedTags.length === 1) p.set('tag', selectedTags[0]);
		goto(`/${lang}/search?${p}`, { replaceState: true, keepFocus: true });
	}

	function onTagChange(vals: string[]) {
		selectedTags = vals;
		applyFilters();
	}

	let debounceTimer: ReturnType<typeof setTimeout>;
	function onQueryInput(e: Event) {
		q = (e.currentTarget as HTMLInputElement).value;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(applyFilters, 300);
	}
</script>

<svelte:head>
	<title>{t('nav.search')} — Demo Co.</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto max-w-4xl px-6 py-16">
	<h1 class="mb-8 text-3xl font-extrabold text-[var(--fg)]">{t('nav.search')}</h1>

	<!-- Filters -->
	<div class="mb-8 flex flex-col gap-4 sm:flex-row">
		<div class="flex-1">
			<label for="search-q" class="sr-only">{t('search.placeholder')}</label>
			<input
				id="search-q"
				type="search"
				value={q}
				oninput={onQueryInput}
				placeholder={t('search.placeholder')}
				class="w-full rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-elev)] px-4 py-2.5 text-sm text-[var(--fg)] placeholder:text-[var(--muted)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
			/>
		</div>
		<div class="w-full sm:w-56">
			<Combobox
				options={tagOptions}
				bind:selected={selectedTags}
				placeholder="Filter by tag…"
				onchange={onTagChange}
			/>
		</div>
	</div>

	<!-- Results count -->
	{#if data.query.q || data.query.tag}
		<p class="mb-6 text-sm text-[var(--muted)]" aria-live="polite">
			{#if data.results.length > 0}
				{t('search.results', {
					count: String(data.results.length),
					query: data.query.q || data.query.tag
				})}
			{:else}
				{t('search.noResults')}
			{/if}
		</p>
	{/if}

	<!-- Results -->
	{#if data.results.length > 0}
		<ol class="space-y-6" aria-label="Search results">
			{#each data.results as post (post.id)}
				<li>
					<Card as="article" hover class="overflow-hidden">
						<a href="/{lang}/blog/{post.slug}" class="block p-5">
							<div class="mb-3 flex flex-wrap gap-2">
								{#each post.tags as tag (tag)}
									{@const tagDef = allTags.find((t2) => t2.slug === tag)}
									<Badge variant="muted">{tagDef?.label[lang] ?? tag}</Badge>
								{/each}
							</div>
							<h2 class="mb-1.5 text-lg font-bold text-[var(--fg)]">{post.title}</h2>
							<p class="mb-3 line-clamp-2 text-sm text-[var(--muted)]">{post.excerpt}</p>
							<div class="flex items-center gap-2 text-xs text-[var(--muted)]">
								<Avatar name={post.author.name} color={post.author.avatarColor} size="sm" />
								<span>{post.author.name}</span>
								<span>·</span>
								<time datetime={post.publishedAt}>{formatDate(post.publishedAt, lang)}</time>
							</div>
						</a>
					</Card>
				</li>
			{/each}
		</ol>
	{:else if !data.query.q && !data.query.tag}
		<p class="text-[var(--muted)]">Start typing to search posts…</p>
	{/if}
</div>
