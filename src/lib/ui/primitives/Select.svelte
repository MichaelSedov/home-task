<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';

	interface Props extends HTMLSelectAttributes {
		label?: string;
		options: { value: string; label: string }[];
	}

	let { label, options, id, class: className = '', ...rest }: Props = $props();

	const selectId = $derived(id ?? `select-${Math.random().toString(36).slice(2, 8)}`);
</script>

<div class="flex flex-col gap-1.5 {className}">
	{#if label}
		<label for={selectId} class="text-sm font-medium text-[var(--fg-2)]">{label}</label>
	{/if}
	<select
		{...rest}
		id={selectId}
		class="w-full appearance-none rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-elev)] px-3 py-2 text-sm text-[var(--fg)] outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
	>
		{#each options as opt (opt.value)}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>
</div>
