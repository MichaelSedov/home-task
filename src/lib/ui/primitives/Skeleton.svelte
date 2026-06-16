<script lang="ts">
	interface Props {
		class?: string;
		lines?: number;
	}

	let { class: className = '', lines = 1 }: Props = $props();
</script>

{#if lines > 1}
	<div class="flex flex-col gap-2 {className}">
		{#each Array(lines) as _unused, i (i)}
			<div
				class="h-4 animate-pulse rounded bg-[var(--bg-soft)] {i === lines - 1 ? 'w-3/4' : 'w-full'}"
			></div>
		{/each}
	</div>
{:else}
	<div class="h-4 w-full animate-pulse rounded bg-[var(--bg-soft)] {className}"></div>
{/if}
