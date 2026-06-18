<script lang="ts">
	import { getT, getLang } from '$lib/i18n/context.js';
	import { formatDate } from '$lib/i18n/t.js';
	import { getTags } from '$lib/i18n/dict.js';
	import Avatar from '$lib/ui/primitives/Avatar.svelte';

	let { data } = $props();
	const t = getT();
	const lang = getLang();
	const allTags = getTags();
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
	<h1 class="mb-10 text-[26px] font-bold tracking-[-0.018em] text-[var(--fg)]">
		{t('blog.title')}
	</h1>

	{#if data.posts.length === 0}
		<p class="text-[var(--muted)]">{t('blog.empty')}</p>
	{:else}
		<!-- Grid layout matching the brief's post-grid -->
		<ol
			class="grid gap-3.5"
			style="grid-template-columns: repeat(auto-fill, minmax(260px, 1fr))"
			aria-label="Blog posts"
		>
			{#each data.posts as post (post.id)}
				<li>
					<a
						href="/{lang}/blog/{post.slug}"
						class="group flex flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elev)] transition-all duration-200 hover:-translate-y-[3px] hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]"
					>
						<!-- Cover — gradient using post's coverColor -->
						<div
							class="h-[70px] flex-shrink-0"
							style="background: linear-gradient(135deg, {post.coverColor}, color-mix(in oklab, {post.coverColor} 60%, black))"
							aria-hidden="true"
						></div>

						<div class="flex flex-1 flex-col p-3.5">
							<!-- Tags -->
							{#if post.tags.length > 0}
								<div class="mb-2 flex flex-wrap gap-1">
									{#each post.tags.slice(0, 3) as tag (tag)}
										{@const tagDef = allTags.find((t2) => t2.slug === tag)}
										<span
											class="rounded-full border border-[var(--border)] bg-[var(--bg-soft)] px-[7px] py-[1.5px] text-[10.5px] font-semibold text-[var(--muted)]"
										>
											{tagDef?.label[lang] ?? tag}
										</span>
									{/each}
								</div>
							{/if}

							<!-- Title -->
							<h2
								class="mb-1.5 text-[14px] font-semibold leading-[1.35] tracking-[-0.005em] text-[var(--fg)]"
							>
								{post.title}
							</h2>

							<!-- Excerpt -->
							<p class="mb-2.5 line-clamp-3 text-[12.5px] leading-[1.5] text-[var(--muted)]">
								{post.excerpt}
							</p>

							<!-- Meta -->
							<div
								class="mt-auto flex flex-wrap items-center gap-2 text-[11px] text-[var(--muted)]"
							>
								<Avatar name={post.author.name} color={post.author.avatarColor} size="sm" />
								<span>{post.author.name}</span>
								<span>·</span>
								<time datetime={post.publishedAt}>{formatDate(post.publishedAt, lang)}</time>
								<span>·</span>
								<span>{t('blog.readingTime', { minutes: String(post.readingTimeMinutes) })}</span>
							</div>
						</div>
					</a>
				</li>
			{/each}
		</ol>
	{/if}
</div>
