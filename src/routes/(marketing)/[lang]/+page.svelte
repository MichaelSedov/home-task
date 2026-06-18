<script lang="ts">
	import { getT, getLang } from '$lib/i18n/context.js';
	import Avatar from '$lib/ui/primitives/Avatar.svelte';
	import Badge from '$lib/ui/primitives/Badge.svelte';
	import Card from '$lib/ui/primitives/Card.svelte';

	let { data } = $props();
	const t = getT();
	const lang = getLang();
	const jsonLdTag = `<script type="application/ld+json">${data.jsonLd}<` + `/script>`;

	// All copy is driven by i18n keys so switching /en ↔ /de re-renders content
	const features = $derived([
		{ icon: '⚡', title: t('home.features.edge.title'), desc: t('home.features.edge.desc') },
		{ icon: '🔒', title: t('home.features.auth.title'), desc: t('home.features.auth.desc') },
		{ icon: '🌍', title: t('home.features.i18n.title'), desc: t('home.features.i18n.desc') },
		{ icon: '📊', title: t('home.features.table.title'), desc: t('home.features.table.desc') },
		{ icon: '♿', title: t('home.features.a11y.title'), desc: t('home.features.a11y.desc') },
		{ icon: '🚀', title: t('home.features.perf.title'), desc: t('home.features.perf.desc') }
	]);

	const pricing = $derived([
		{
			name: t('home.pricing.starter.name'),
			price: t('home.pricing.starter.price'),
			desc: t('home.pricing.starter.desc'),
			features: [
				t('home.pricing.starter.f1'),
				t('home.pricing.starter.f2'),
				t('home.pricing.starter.f3')
			]
		},
		{
			name: t('home.pricing.pro.name'),
			price: t('home.pricing.pro.price'),
			desc: t('home.pricing.pro.desc'),
			features: [
				t('home.pricing.pro.f1'),
				t('home.pricing.pro.f2'),
				t('home.pricing.pro.f3'),
				t('home.pricing.pro.f4')
			],
			highlight: true
		},
		{
			name: t('home.pricing.ent.name'),
			price: t('home.pricing.ent.price'),
			desc: t('home.pricing.ent.desc'),
			features: [
				t('home.pricing.ent.f1'),
				t('home.pricing.ent.f2'),
				t('home.pricing.ent.f3'),
				t('home.pricing.ent.f4')
			]
		}
	]);

	const testimonials = $derived([
		{ quote: t('home.social.t1.quote'), author: 'Omar Haddad', role: t('home.social.t1.role') },
		{ quote: t('home.social.t2.quote'), author: 'Anna Becker', role: t('home.social.t2.role') },
		{ quote: t('home.social.t3.quote'), author: 'Marek Dvořák', role: t('home.social.t3.role') }
	]);

	const trustedBy = ['Acme', 'Hyperion', 'Northwind', 'Outpost', 'Vega', 'Lumen'];
</script>

<svelte:head>
	<title>Demo Co. — {t('home.hero.title')}</title>
	<meta name="description" content={t('home.hero.subtitle')} />
	<link rel="canonical" href="{data.origin}/{lang}" />
	<meta property="og:title" content="Demo Co." />
	<meta property="og:description" content={t('home.hero.subtitle')} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="{data.origin}/{lang}" />
	<link rel="alternate" hreflang="en" href="{data.origin}/en" />
	<link rel="alternate" hreflang="de" href="{data.origin}/de" />
	<link rel="alternate" hreflang="x-default" href="{data.origin}/en" />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html jsonLdTag}
</svelte:head>

<!-- Hero -->
<section
	class="relative overflow-hidden border-b border-[var(--border)] bg-[var(--bg-elev)] px-6 py-24 text-center"
>
	<div class="pointer-events-none absolute inset-0">
		<div
			class="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-[var(--accent)] opacity-10 blur-3xl"
		></div>
		<div
			class="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-[var(--accent-2)] opacity-10 blur-3xl"
		></div>
	</div>
	<div class="relative mx-auto max-w-3xl">
		<!-- eyebrow label — matches brief style -->
		<div class="mb-4 inline-flex items-center gap-2">
			<span class="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)]"></span>
			<span
				class="font-mono text-[11.5px] font-bold uppercase tracking-[0.1em] text-[var(--accent-ink)]"
			>
				{t('home.eyebrow')}
			</span>
		</div>

		<!-- gradient h1 — bg-clip-text with extra padding to prevent descender clipping -->
		<h1
			class="mb-4 bg-gradient-to-b from-[var(--fg)] to-[var(--fg-2)] bg-clip-text text-transparent"
			style="font-size: clamp(34px, 4.4vw, 46px); font-weight: 800; line-height: 1.15; letter-spacing: -0.025em; padding-bottom: 0.1em;"
		>
			{t('home.hero.title')}
		</h1>
		<p class="mb-8 max-w-[64ch] text-[18px] leading-[1.62] text-[var(--muted)]">
			{t('home.hero.subtitle')}
		</p>
		<div class="flex flex-wrap items-center justify-center gap-3">
			<a
				href="/{lang}/blog"
				class="inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--accent)] px-6 py-3 text-base font-medium text-white transition-all duration-150 hover:opacity-90 active:scale-[0.98]"
			>
				{t('home.hero.cta')}
			</a>
			<a
				href="/login"
				class="inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-soft)] px-6 py-3 text-base font-medium text-[var(--fg)] transition-all duration-150 hover:bg-[var(--border)] active:scale-[0.98]"
			>
				{t('nav.login')}
			</a>
		</div>
	</div>
</section>

<!-- Features -->
<section aria-labelledby="features-heading" class="mx-auto max-w-6xl px-6 py-20">
	<h2
		id="features-heading"
		class="mb-12 text-center text-[26px] font-bold tracking-[-0.018em] text-[var(--fg)]"
	>
		{t('home.features.title')}
	</h2>
	<ul class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" role="list">
		{#each features as f (f.title)}
			<li>
				<Card class="h-full p-6">
					<div class="mb-3 text-3xl" aria-hidden="true">{f.icon}</div>
					<h3 class="mb-2 font-semibold text-[var(--fg)]">{f.title}</h3>
					<p class="text-sm leading-relaxed text-[var(--muted)]">{f.desc}</p>
				</Card>
			</li>
		{/each}
	</ul>
</section>

<!-- Pricing -->
<section aria-labelledby="pricing-heading" class="bg-[var(--bg-soft)] px-6 py-20">
	<div class="mx-auto max-w-5xl">
		<h2
			id="pricing-heading"
			class="mb-12 text-center text-[26px] font-bold tracking-[-0.018em] text-[var(--fg)]"
		>
			{t('home.pricing.title')}
		</h2>
		<div class="grid gap-6 md:grid-cols-3">
			{#each pricing as plan (plan.name)}
				<Card
					class="relative flex flex-col p-6 {plan.highlight
						? 'border-[var(--accent)] shadow-[var(--shadow-lg)] ring-1 ring-[var(--accent)]'
						: ''}"
				>
					{#if plan.highlight}
						<Badge variant="accent" class="absolute -top-3 left-1/2 -translate-x-1/2"
							>{t('home.pricing.popular')}</Badge
						>
					{/if}
					<h3 class="text-lg font-bold text-[var(--fg)]">{plan.name}</h3>
					<p class="mt-1 text-sm text-[var(--muted)]">{plan.desc}</p>
					<p class="my-4 text-4xl font-extrabold text-[var(--fg)]">{plan.price}</p>
					<ul class="flex-1 space-y-2 text-sm text-[var(--fg-2)]" role="list">
						{#each plan.features as feat (feat)}
							<li class="flex items-center gap-2">
								<span class="text-[var(--accent)]" aria-hidden="true">✓</span>
								{feat}
							</li>
						{/each}
					</ul>
					<a
						href="/login"
						class="mt-6 inline-flex w-full items-center justify-center rounded-[var(--radius-sm)] px-4 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.98] {plan.highlight
							? 'bg-[var(--accent)] text-white hover:opacity-90'
							: 'border border-[var(--border)] bg-[var(--bg-soft)] text-[var(--fg)] hover:bg-[var(--border)]'}"
					>
						{t('home.pricing.cta')}
					</a>
				</Card>
			{/each}
		</div>
	</div>
</section>

<!-- Social proof -->
<section aria-labelledby="social-proof-heading" class="px-6 py-20">
	<div class="mx-auto max-w-5xl">
		<h2 id="social-proof-heading" class="sr-only">{t('home.social.heading')}</h2>

		<p class="mb-8 text-center text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
			{t('home.social.trustedBy')}
		</p>
		<ul
			class="mb-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 opacity-70"
			role="list"
		>
			{#each trustedBy as company (company)}
				<li class="text-lg font-semibold tracking-tight text-[var(--fg-2)]">{company}</li>
			{/each}
		</ul>

		<ul class="grid gap-6 md:grid-cols-3" role="list">
			{#each testimonials as t2 (t2.author)}
				<li>
					<Card class="h-full p-6">
						<p class="mb-4 text-sm leading-relaxed text-[var(--fg-2)]">
							<span aria-hidden="true" class="mr-1 text-[var(--accent)]">“</span>{t2.quote}<span
								aria-hidden="true"
								class="text-[var(--accent)]">”</span
							>
						</p>
						<div class="flex items-center gap-3 border-t border-[var(--border)] pt-4">
							<Avatar name={t2.author} size="md" />
							<div>
								<p class="text-sm font-medium text-[var(--fg)]">{t2.author}</p>
								<p class="text-xs text-[var(--muted)]">{t2.role}</p>
							</div>
						</div>
					</Card>
				</li>
			{/each}
		</ul>
	</div>
</section>
