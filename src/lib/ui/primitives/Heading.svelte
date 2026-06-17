<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		level?: 1 | 2 | 3 | 4;
		size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
		id?: string;
		class?: string;
	}

	let { children, level = 2, size, id, class: className = '' }: Props = $props();

	// Default size maps to level if not overridden
	const effectiveSize = $derived(
		size ?? (level === 1 ? '2xl' : level === 2 ? 'xl' : level === 3 ? 'lg' : 'md')
	);

	const sizes = {
		sm: 'text-base font-semibold',
		md: 'text-lg font-semibold',
		lg: 'text-2xl font-bold',
		xl: 'text-3xl font-bold tracking-tight',
		'2xl': 'text-4xl md:text-5xl font-extrabold tracking-tight'
	};

	const tag = $derived(`h${level}` as const);
	const cls = $derived(`text-[var(--fg)] ${sizes[effectiveSize]} ${className}`);
</script>

<svelte:element this={tag} {id} class={cls}>
	{@render children()}
</svelte:element>
