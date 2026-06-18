<script lang="ts">
	import { setT, setLang } from '$lib/i18n/context.js';
	import { makeT } from '$lib/i18n/t.js';
	import { page } from '$app/stores';
	import ThemeToggle from '$lib/ui/primitives/ThemeToggle.svelte';

	let { data, children } = $props();

	setT(makeT(data.dict));
	setLang(data.lang);

	const t = makeT(data.dict);

	const lang = $derived(data.lang);
	const user = $derived(data.user);
	const prefix = $derived(`/${lang}`);

	const otherLang = $derived(lang === 'en' ? 'de' : 'en');
	// $derived computes the STRING directly so $page is a tracked dependency
	const localeSwitchHref = $derived(
		$page.url.pathname.startsWith('/en')
			? $page.url.pathname.replace(/^\/en/, '/de')
			: $page.url.pathname.startsWith('/de')
				? $page.url.pathname.replace(/^\/de/, '/en')
				: `/${otherLang}`
	);

	const isActive = (href: string) => $page.url.pathname.startsWith(href);

	// Persist locale choice so the root path "/" redirects to it on next visit
	$effect(() => {
		if (typeof document === 'undefined') return;
		document.cookie = `lang=${lang};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
	});
</script>

<div class="flex min-h-screen flex-col">
	<nav
		aria-label="Main navigation"
		class="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg-elev)]/80 backdrop-blur-sm"
	>
		<div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
			<!-- Logo -->
			<a
				href="/{lang}"
				class="font-mono text-sm font-bold tracking-tight text-[var(--fg)] transition-colors hover:text-[var(--accent)]"
				style="font-feature-settings: 'ss01'"
			>
				Demo Co.
			</a>

			<!-- Nav links -->
			<div class="flex items-center gap-0.5">
				{#each [{ href: `${prefix}/blog`, label: t('nav.blog') }, { href: `${prefix}/search`, label: t('nav.search') }] as link (link.href)}
					<a
						href={link.href}
						class="rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors
							{isActive(link.href)
							? 'text-[var(--fg)]'
							: 'text-[var(--muted)] hover:bg-[var(--bg-soft)] hover:text-[var(--fg)]'}"
					>
						{link.label}
					</a>
				{/each}

				<div class="mx-3 h-4 w-px bg-[var(--border-strong)]"></div>

				<!-- Language switcher — matches the pill style from the brief's lang-switch component -->
				<div
					class="inline-flex items-center gap-0.5 rounded-[8px] border border-[var(--border)] bg-[var(--bg-soft)] p-0.5"
					role="group"
					aria-label="Language"
				>
					{#each ['en', 'de'] as l (l)}
						{#if l === lang}
							<span
								class="rounded-[6px] bg-[var(--bg-elev)] px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--fg)] shadow-[var(--shadow-sm)]"
								aria-current="true"
							>
								{l}
							</span>
						{:else}
							<a
								href={localeSwitchHref}
								hreflang={l}
								data-sveltekit-reload
								class="rounded-[6px] px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.05em] text-[var(--muted)] transition-colors hover:text-[var(--fg)]"
							>
								{l}
							</a>
						{/if}
					{/each}
				</div>

				<div class="mx-3 h-4 w-px bg-[var(--border-strong)]"></div>

				{#if user}
					<a
						href="/dashboard"
						class="rounded-lg px-3 py-1.5 text-[13px] font-medium text-[var(--muted)] transition-colors hover:bg-[var(--bg-soft)] hover:text-[var(--fg)]"
					>
						{t('nav.dashboard')}
					</a>
				{:else if !$page.url.pathname.startsWith('/login')}
					<a
						href="/login"
						class="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-[13px] font-medium text-white transition-opacity hover:opacity-90"
					>
						{t('nav.login')}
					</a>
				{/if}

				<ThemeToggle />
			</div>
		</div>
	</nav>

	<main id="main-content" class="flex-1">
		{@render children()}
	</main>

	<footer class="border-t border-[var(--border)] py-8 text-center text-[13px] text-[var(--muted)]">
		{t('footer.copy')}
	</footer>
</div>
