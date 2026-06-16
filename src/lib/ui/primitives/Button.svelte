<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		children: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const base =
		'inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] font-medium transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:pointer-events-none disabled:opacity-50';

	const variants = {
		primary: 'bg-[var(--accent)] text-white hover:opacity-90 active:scale-[0.98]',
		secondary:
			'bg-[var(--bg-soft)] text-[var(--fg)] border border-[var(--border)] hover:bg-[var(--border)] active:scale-[0.98]',
		ghost: 'text-[var(--fg-2)] hover:bg-[var(--bg-soft)] active:scale-[0.98]',
		danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]'
	};

	const sizes = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2 text-sm',
		lg: 'px-6 py-3 text-base'
	};
</script>

<button class="{base} {variants[variant]} {sizes[size]} {className}" {...rest}>
	{@render children()}
</button>
