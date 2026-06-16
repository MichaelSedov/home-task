<script lang="ts">
	import { toasts } from '../toast.store.js';
	import { fly } from 'svelte/transition';

	const icons = { info: 'ℹ', success: '✓', error: '✕' };
	const colors = {
		info: 'border-[var(--border)] bg-[var(--bg-elev)]',
		success: 'border-[var(--good-border)] bg-[var(--good-bg)]',
		error: 'border-red-400 bg-red-50 dark:bg-red-950'
	};
</script>

<div
	role="status"
	aria-live="polite"
	aria-atomic="false"
	class="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-2"
>
	{#each $toasts as toast (toast.id)}
		<div
			in:fly={{ y: 12, duration: 200 }}
			out:fly={{ y: 12, duration: 150 }}
			role="alert"
			class="pointer-events-auto flex max-w-sm items-start gap-3 rounded-[var(--radius-md)] border p-4 shadow-[var(--shadow-lg)] {colors[
				toast.variant
			]}"
		>
			<span class="mt-0.5 text-sm font-bold" aria-hidden="true">{icons[toast.variant]}</span>
			<p class="flex-1 text-sm text-[var(--fg)]">{toast.message}</p>
			<button
				onclick={() => toasts.remove(toast.id)}
				aria-label="Dismiss"
				class="shrink-0 text-[var(--muted)] hover:text-[var(--fg)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent)]"
			>
				✕
			</button>
		</div>
	{/each}
</div>
