<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		size?: 'sm' | 'md' | 'lg' | 'xl';
		as?: 'div' | 'section' | 'main' | 'article';
		class?: string;
	}

	let { children, size = 'lg', as: tag = 'div', class: className = '' }: Props = $props();

	const widths = {
		sm: 'max-w-2xl',
		md: 'max-w-4xl',
		lg: 'max-w-6xl',
		xl: 'max-w-7xl'
	};

	const cls = $derived(`mx-auto w-full px-6 ${widths[size]} ${className}`);
</script>

<svelte:element this={tag} class={cls}>
	{@render children()}
</svelte:element>
