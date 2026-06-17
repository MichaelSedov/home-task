<script lang="ts">
	import { enhance } from '$app/forms';
	import { LoginInputSchema } from '$lib/schemas/user.js';
	import Input from '$lib/ui/primitives/Input.svelte';
	import Button from '$lib/ui/primitives/Button.svelte';
	import Card from '$lib/ui/primitives/Card.svelte';

	let { form } = $props();

	const dict: Record<string, string> = {
		'login.title': 'Sign in',
		'login.email': 'Email',
		'login.password': 'Password',
		'login.submit': 'Sign in',
		'login.error': 'Invalid email or password.',
		'login.emailRequired': 'Enter a valid email address.',
		'login.passwordRequired': 'Enter your password.'
	};
	const t = (k: string) => dict[k] ?? k;

	// Client-side state mirrors what the server action will receive.
	let email = $state('');
	let password = $state('');
	let emailError = $state<string | null>(null);
	let passwordError = $state<string | null>(null);
	let submitting = $state(false);

	function validate(): boolean {
		// Use the SAME schema as the server action (lib/schemas/user.ts).
		const result = LoginInputSchema.safeParse({ email, password });
		emailError = null;
		passwordError = null;
		if (result.success) return true;

		for (const issue of result.error.issues) {
			const field = issue.path[0];
			if (field === 'email') emailError = t('login.emailRequired');
			if (field === 'password') passwordError = t('login.passwordRequired');
		}
		return false;
	}
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

		<form
			method="POST"
			class="flex flex-col gap-4"
			use:enhance={({ cancel }) => {
				if (!validate()) {
					cancel();
					return;
				}
				submitting = true;
				return async ({ update }) => {
					await update();
					submitting = false;
				};
			}}
		>
			<Input
				label={t('login.email')}
				type="email"
				name="email"
				id="email"
				autocomplete="email"
				placeholder="you@demo.test"
				bind:value={email}
				error={emailError ?? undefined}
			/>
			<Input
				label={t('login.password')}
				type="password"
				name="password"
				id="password"
				autocomplete="current-password"
				bind:value={password}
				error={passwordError ?? undefined}
			/>
			<Button type="submit" variant="primary" class="mt-2 w-full" disabled={submitting}>
				{submitting ? '…' : t('login.submit')}
			</Button>
		</form>

		<p class="mt-6 text-xs text-[var(--muted)]">
			Demo: <code>admin@demo.test</code> / <code>demo1234</code>
		</p>
	</Card>
</div>
