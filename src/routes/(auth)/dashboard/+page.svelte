<script lang="ts">
	import { getT } from '$lib/i18n/context.js';
	const t = getT();
</script>

<svelte:head>
	<title>Dashboard — Demo Co.</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto max-w-7xl px-6 py-12">
	<h1 class="mb-6 text-3xl font-bold text-[var(--fg)]">{t('dashboard.title')}</h1>
	<p class="text-[var(--muted)]">
		Welcome to the dashboard. <a
			href="/dashboard/items"
			class="font-medium text-[var(--accent)] hover:underline">View campaigns →</a
		>
	</p>
</div>
