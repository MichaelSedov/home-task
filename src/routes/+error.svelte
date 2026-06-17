<script lang="ts">
	import { page } from '$app/stores';

	const isNotFound = $derived($page.status === 404);

	const messages = {
		en: {
			notFound: {
				title: 'Page not found',
				body: "We couldn't find what you were looking for.",
				cta: 'Go home'
			},
			generic: {
				title: 'Something went wrong',
				body: 'An unexpected error occurred.',
				cta: 'Go home'
			}
		},
		de: {
			notFound: {
				title: 'Seite nicht gefunden',
				body: 'Wir konnten nicht finden, wonach Sie gesucht haben.',
				cta: 'Zur Startseite'
			},
			generic: {
				title: 'Etwas ist schiefgelaufen',
				body: 'Ein unerwarteter Fehler ist aufgetreten.',
				cta: 'Zur Startseite'
			}
		}
	} as const;

	const lang = $derived(($page.url.pathname.startsWith('/de') ? 'de' : 'en') as 'en' | 'de');
	const copy = $derived(isNotFound ? messages[lang].notFound : messages[lang].generic);
</script>

<svelte:head>
	<title>{$page.status} — {copy.title}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main
	id="main-content"
	class="flex min-h-screen flex-col items-center justify-center gap-3 p-8 text-center"
>
	<p
		class="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] bg-clip-text text-7xl font-extrabold tracking-tight text-transparent"
		aria-hidden="true"
	>
		{$page.status}
	</p>
	<h1 class="text-2xl font-semibold text-[var(--fg)]">{copy.title}</h1>
	<p class="max-w-md text-sm text-[var(--muted)]">
		{$page.error?.message && !isNotFound ? $page.error.message : copy.body}
	</p>
	<a
		href="/{lang}"
		data-sveltekit-reload
		class="mt-4 rounded-[var(--radius-sm)] bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
	>
		{copy.cta}
	</a>
</main>
