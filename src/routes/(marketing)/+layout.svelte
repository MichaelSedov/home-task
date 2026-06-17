<script lang="ts">
	import { setT, setLang } from '$lib/i18n/context.js';
	import { makeT } from '$lib/i18n/t.js';
	import { page } from '$app/stores';

	let { data, children } = $props();

	// Must run synchronously during component init for SSR.
	// Locale switching uses a full page reload (hreflang links), so this is safe.
	setT(makeT(data.dict));
	setLang(data.lang);

	const t = makeT(data.dict);

	const lang = $derived(data.lang);
	const user = $derived(data.user);

	const prefix = $derived(`/${lang}`);

	// Swap /en ↔ /de robustly — replace only the leading segment
	const otherLang = $derived(lang === 'en' ? 'de' : 'en');
	const localeSwitchHref = $derived(() => {
		const path = $page.url.pathname;
		// replace leading /en or /de, fall back to switching root
		if (path.startsWith('/en')) return path.replace(/^\/en/, '/de');
		if (path.startsWith('/de')) return path.replace(/^\/de/, '/en');
		return `/${otherLang}`;
	});

	// Theme toggle
	function toggleTheme() {
		const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
		document.documentElement.setAttribute('data-theme', next);
		document.cookie = `theme=${next};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
	}
</script>

<div class="flex min-h-screen flex-col">
	<nav
		aria-label="Main navigation"
		class="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg-elev)]/80 backdrop-blur"
	>
		<div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
			<a href="/{lang}" class="text-lg font-bold text-[var(--fg)] hover:text-[var(--accent)]">
				Demo Co.
			</a>

			<div class="flex items-center gap-1">
				<a
					href="{prefix}/blog"
					class="rounded-md px-3 py-1.5 text-sm text-[var(--fg-2)] hover:bg-[var(--bg-soft)] hover:text-[var(--fg)] {$page.url.pathname.includes(
						'/blog'
					)
						? 'font-medium text-[var(--fg)]'
						: ''}"
				>
					{t('nav.blog')}
				</a>
				<a
					href="{prefix}/search"
					class="rounded-md px-3 py-1.5 text-sm text-[var(--fg-2)] hover:bg-[var(--bg-soft)] hover:text-[var(--fg)]"
				>
					{t('nav.search')}
				</a>

				<div class="mx-2 h-5 w-px bg-[var(--border)]"></div>

				<!-- Locale switcher -->
				<a
					href={localeSwitchHref()}
					class="rounded-md px-2 py-1 text-xs font-medium text-[var(--muted)] hover:bg-[var(--bg-soft)] hover:text-[var(--fg)]"
					hreflang={otherLang}
				>
					{otherLang.toUpperCase()}
				</a>

				{#if user}
					<a
						href="/dashboard"
						class="rounded-md px-3 py-1.5 text-sm text-[var(--fg-2)] hover:bg-[var(--bg-soft)]"
					>
						{t('nav.dashboard')}
					</a>
				{:else}
					<a
						href="/login"
						class="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
					>
						{t('nav.login')}
					</a>
				{/if}

				<button
					onclick={toggleTheme}
					aria-label="Toggle theme"
					class="rounded-md p-1.5 text-[var(--muted)] hover:bg-[var(--bg-soft)] hover:text-[var(--fg)]"
				>
					<span aria-hidden="true" class="text-base">◐</span>
				</button>
			</div>
		</div>
	</nav>

	<main id="main-content" class="flex-1">
		{@render children()}
	</main>

	<footer class="border-t border-[var(--border)] py-8 text-center text-sm text-[var(--muted)]">
		{t('footer.copy')}
	</footer>
</div>
