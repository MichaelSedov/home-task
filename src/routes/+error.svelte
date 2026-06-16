<script lang="ts">
	import { page } from '$app/stores';
</script>

<main
	id="main-content"
	class="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center"
>
	<p class="text-6xl font-bold text-[var(--accent)]">{$page.status}</p>
	<h1 class="text-2xl font-semibold text-[var(--fg)]">
		{$page.error?.message ?? 'Something went wrong.'}
	</h1>
	<a
		href="/"
		data-sveltekit-reload
		class="mt-4 rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
	>
		Go home
	</a>
</main>
