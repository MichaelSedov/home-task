<script lang="ts">
	import { getT, getLang } from '$lib/i18n/context.js';
	import Avatar from '$lib/ui/primitives/Avatar.svelte';
	import Badge from '$lib/ui/primitives/Badge.svelte';
	import Card from '$lib/ui/primitives/Card.svelte';

	let { data } = $props();
	const t = getT();
	const lang = getLang();
	const jsonLdTag = `<script type="application/ld+json">${data.jsonLd}<` + `/script>`;

	const features = [
		{
			icon: '⚡',
			title: 'Edge-first rendering',
			desc: 'SSG for marketing, streamed SSR for dashboard. Every route gets the right strategy.'
		},
		{
			icon: '🔒',
			title: 'Auth built-in',
			desc: 'HMAC-signed sessions, role-based access, and server-validated forms out of the box.'
		},
		{
			icon: '🌍',
			title: 'Internationalised',
			desc: 'EN and DE with locale-aware URLs, hreflang, and Intl formatters throughout.'
		},
		{
			icon: '📊',
			title: 'Data table',
			desc: 'Paginated, sorted, filtered table of 220 rows with optimistic inline editing.'
		},
		{
			icon: '♿',
			title: 'Accessible by default',
			desc: 'Semantic HTML, keyboard navigation, WCAG AA contrast, axe-clean E2E tests.'
		},
		{
			icon: '🚀',
			title: 'Performance budgeted',
			desc: 'LCP < 2s, CLS < 0.1, INP < 200ms — enforced in CI, not just measured.'
		}
	];

	const pricing = [
		{
			name: 'Starter',
			price: '$0',
			desc: 'For personal projects',
			features: ['3 campaigns', '1 user', 'Community support']
		},
		{
			name: 'Pro',
			price: '$49/mo',
			desc: 'For growing teams',
			features: ['Unlimited campaigns', '10 users', 'Priority support', 'Analytics'],
			highlight: true
		},
		{
			name: 'Enterprise',
			price: 'Custom',
			desc: 'For large organisations',
			features: ['Unlimited everything', 'SSO', 'SLA', 'Dedicated support']
		}
	];

	const testimonials = [
		{
			quote:
				'We rebuilt our marketing site on this stack and cut LCP from 3.4s to 0.8s. The team stopped fighting the framework.',
			author: 'Omar Haddad',
			role: 'Staff Engineer, Northwind'
		},
		{
			quote:
				"Tokens, runes, and streamed loads — these aren't novelty, they're how I want every project to feel.",
			author: 'Anna Becker',
			role: 'Design Engineer, Hyperion'
		},
		{
			quote: "Our team's pull request reviews got noticeably shorter. The code reads itself.",
			author: 'Marek Dvořák',
			role: 'Tech Lead, Outpost'
		}
	];

	const trustedBy = ['Acme', 'Hyperion', 'Northwind', 'Outpost', 'Vega', 'Lumen'];
</script>

<svelte:head>
	<title>Demo Co. — Build a faster web</title>
	<meta name="description" content="A performance-first stack for teams that ship." />
	<link rel="canonical" href="/{lang}" />
	<meta property="og:title" content="Demo Co." />
	<meta property="og:description" content="A performance-first stack for teams that ship." />
	<meta property="og:type" content="website" />
	<link rel="alternate" hreflang="en" href="/en" />
	<link rel="alternate" hreflang="de" href="/de" />
	<link rel="alternate" hreflang="x-default" href="/en" />
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
		<Badge variant="accent" class="mb-4">SvelteKit · TypeScript · Tailwind</Badge>
		<h1 class="mb-4 text-5xl font-extrabold tracking-tight text-[var(--fg)] md:text-6xl">
			{t('home.hero.title')}
		</h1>
		<p class="mb-8 text-xl text-[var(--muted)]">{t('home.hero.subtitle')}</p>
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
				Sign in
			</a>
		</div>
	</div>
</section>

<!-- Features -->
<section aria-labelledby="features-heading" class="mx-auto max-w-6xl px-6 py-20">
	<h2 id="features-heading" class="mb-12 text-center text-3xl font-bold text-[var(--fg)]">
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
		<h2 id="pricing-heading" class="mb-12 text-center text-3xl font-bold text-[var(--fg)]">
			Pricing
		</h2>
		<div class="grid gap-6 md:grid-cols-3">
			{#each pricing as plan (plan.name)}
				<Card
					class="relative flex flex-col p-6 {plan.highlight
						? 'border-[var(--accent)] shadow-[var(--shadow-lg)] ring-1 ring-[var(--accent)]'
						: ''}"
				>
					{#if plan.highlight}
						<Badge variant="accent" class="absolute -top-3 left-1/2 -translate-x-1/2">Popular</Badge
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
						Get started
					</a>
				</Card>
			{/each}
		</div>
	</div>
</section>

<!-- Social proof -->
<section aria-labelledby="social-proof-heading" class="px-6 py-20">
	<div class="mx-auto max-w-5xl">
		<h2 id="social-proof-heading" class="sr-only">Customer testimonials</h2>

		<p class="mb-8 text-center text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
			Trusted by teams at
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
