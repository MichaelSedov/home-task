<script lang="ts">
	import { enhance } from '$app/forms';
	import Input from '$lib/ui/primitives/Input.svelte';
	import Button from '$lib/ui/primitives/Button.svelte';
	import Card from '$lib/ui/primitives/Card.svelte';

	let { form } = $props();

	// i18n minimal inline (login page may appear before marketing layout dict loads)
	const dict: Record<string, string> = {
		'login.title': 'Sign in',
		'login.email': 'Email',
		'login.password': 'Password',
		'login.submit': 'Sign in',
		'login.error': 'Invalid email or password.'
	};
	const t = (k: string) => dict[k] ?? k;
</script>

<svelte:head>
	<title>Sign in — Demo Co.</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-[var(--bg)] px-4">
	<Card class="w-full max-w-sm p-8">
		<h1 class="mb-6 text-2xl font-bold text-[var(--fg)]">{t('login.title')}</h1>

		{#if form?.error}
			<div
				role="alert"
				class="mb-4 rounded-[var(--radius-sm)] border border-red-400 bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
			>
				{t(form.error)}
			</div>
		{/if}

		<form method="POST" use:enhance class="flex flex-col gap-4">
			<Input
				label={t('login.email')}
				type="email"
				name="email"
				id="email"
				autocomplete="email"
				required
				placeholder="you@demo.test"
			/>
			<Input
				label={t('login.password')}
				type="password"
				name="password"
				id="password"
				autocomplete="current-password"
				required
			/>
			<Button type="submit" variant="primary" class="mt-2 w-full">
				{t('login.submit')}
			</Button>
		</form>

		<p class="mt-6 text-xs text-[var(--muted)]">
			Demo: <code>admin@demo.test</code> / <code>demo1234</code>
		</p>
	</Card>
</div>
