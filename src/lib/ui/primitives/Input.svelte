<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		label?: string;
		error?: string;
	}

	let { label, error, id, class: className = '', ...rest }: Props = $props();

	// Use $derived so inputId re-evaluates if id prop changes
	const inputId = $derived(id ?? `input-${Math.random().toString(36).slice(2, 8)}`);
</script>

<div class="flex flex-col gap-1.5 {className}">
	{#if label}
		<label for={inputId} class="text-sm font-medium text-[var(--fg-2)]">{label}</label>
	{/if}
	<input
		{...rest}
		id={inputId}
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? `${inputId}-err` : undefined}
		class="w-full rounded-[var(--radius-sm)] border px-3 py-2 text-sm text-[var(--fg)] placeholder:text-[var(--muted)] outline-none transition-colors bg-[var(--bg-elev)]
			{error
			? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
			: 'border-[var(--border)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]'}"
	/>
	{#if error}
		<p id="{inputId}-err" role="alert" class="text-xs text-red-500">{error}</p>
	{/if}
</div>
