<script lang="ts">
	import { setT, setLang } from '$lib/i18n/context.js';
	import { makeT } from '$lib/i18n/t.js';
	import { enhance } from '$app/forms';
	import Avatar from '$lib/ui/primitives/Avatar.svelte';
	import ThemeToggle from '$lib/ui/primitives/ThemeToggle.svelte';

	let { data, children } = $props();

	setT(makeT(data.dict));
	setLang(data.lang);

	const t = makeT(data.dict);
</script>

<div class="flex min-h-screen flex-col">
	<header
		class="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg-elev)]/80 backdrop-blur-sm"
	>
		<div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
			<!-- Same logo style as marketing layout -->
			<a
				href="/{data.lang}"
				class="font-mono text-sm font-bold tracking-tight text-[var(--fg)] transition-colors hover:text-[var(--accent)]"
			>
				Demo Co.
			</a>

			<nav aria-label="Dashboard navigation" class="flex items-center gap-0.5">
				<a
					href="/dashboard/items"
					class="rounded-lg px-3 py-1.5 text-[13px] font-medium text-[var(--muted)] transition-colors hover:bg-[var(--bg-soft)] hover:text-[var(--fg)]"
				>
					{t('dashboard.items.title')}
				</a>

				<div class="mx-3 h-4 w-px bg-[var(--border-strong)]"></div>

				<div class="flex items-center gap-2 text-[13px] text-[var(--fg-2)]">
					<Avatar name={data.user.name} size="sm" />
					<span class="font-medium">{data.user.name}</span>
					<span
						class="rounded-full border border-[var(--border)] px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.05em] text-[var(--muted)]"
					>
						{data.user.role}
					</span>
				</div>

				<div class="mx-3 h-4 w-px bg-[var(--border-strong)]"></div>

				<form method="POST" action="/logout" use:enhance>
					<button
						type="submit"
						class="cursor-pointer rounded-lg px-3 py-1.5 text-[13px] font-medium text-[var(--muted)] transition-colors hover:bg-[var(--bg-soft)] hover:text-[var(--fg)]"
					>
						{t('nav.logout')}
					</button>
				</form>

				<!-- Same ThemeToggle component as marketing layout -->
				<ThemeToggle />
			</nav>
		</div>
	</header>

	<main id="main-content" class="flex-1 bg-[var(--bg)]">
		{@render children()}
	</main>
</div>
