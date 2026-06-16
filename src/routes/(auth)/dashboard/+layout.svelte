<script lang="ts">
	import { setT, setLang } from '$lib/i18n/context.js';
	import { makeT } from '$lib/i18n/t.js';
	import { enhance } from '$app/forms';
	import Avatar from '$lib/ui/primitives/Avatar.svelte';

	let { data, children } = $props();

	setT(makeT(data.dict));
	setLang(data.lang);

	const t = makeT(data.dict);

	function toggleTheme() {
		const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
		document.documentElement.setAttribute('data-theme', next);
		document.cookie = `theme=${next};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
	}
</script>

<div class="flex min-h-screen flex-col">
	<!-- Top bar -->
	<header
		class="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg-elev)]/90 backdrop-blur"
	>
		<div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
			<a href="/{data.lang}" class="text-base font-bold text-[var(--fg)]">Demo Co.</a>

			<nav aria-label="Dashboard navigation" class="flex items-center gap-2">
				<a
					href="/dashboard/items"
					class="rounded-md px-3 py-1.5 text-sm text-[var(--fg-2)] hover:bg-[var(--bg-soft)]"
				>
					{t('dashboard.items.title')}
				</a>

				<div class="mx-2 h-5 w-px bg-[var(--border)]"></div>

				<div class="flex items-center gap-2 text-sm text-[var(--fg-2)]">
					<Avatar name={data.user.name} size="sm" />
					<span>{data.user.name}</span>
					<span
						class="rounded-full border border-[var(--border)] px-1.5 py-0.5 text-xs text-[var(--muted)]"
						>{data.user.role}</span
					>
				</div>

				<form method="POST" action="/logout" use:enhance>
					<button
						type="submit"
						class="rounded-md px-3 py-1.5 text-sm text-[var(--muted)] hover:bg-[var(--bg-soft)] hover:text-[var(--fg)]"
					>
						{t('nav.logout')}
					</button>
				</form>

				<button
					onclick={toggleTheme}
					aria-label="Toggle theme"
					class="rounded-md p-1.5 text-[var(--muted)] hover:bg-[var(--bg-soft)]"
				>
					<span aria-hidden="true" class="text-base">◐</span>
				</button>
			</nav>
		</div>
	</header>

	<main id="main-content" class="flex-1 bg-[var(--bg)]">
		{@render children()}
	</main>
</div>
