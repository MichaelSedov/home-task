<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		class?: string;
		as?: 'div' | 'article' | 'section' | 'li';
		hover?: boolean;
	}

	let { children, class: className = '', as: tag = 'div', hover = false }: Props = $props();

	const cls = $derived(
		`rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg-elev)] shadow-[var(--shadow-sm)] ${hover ? 'transition-shadow duration-200 hover:shadow-[var(--shadow-md)]' : ''} ${className}`
	);
</script>

<svelte:element this={tag} class={cls}>
	{@render children()}
</svelte:element>
