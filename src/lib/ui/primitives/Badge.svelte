<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'default' | 'accent' | 'success' | 'warn' | 'muted';
		children: Snippet;
		class?: string;
	}

	let { variant = 'default', class: className = '', children }: Props = $props();

	const variants = {
		default: 'bg-[var(--bg-soft)] text-[var(--fg-2)] border border-[var(--border)]',
		accent: 'bg-[var(--accent-soft)] text-[var(--accent-ink)] border border-[var(--accent)]',
		success: 'bg-[var(--good-bg)] text-[var(--good-ink)] border border-[var(--good-border)]',
		warn: 'bg-[var(--warn-bg)] text-[var(--fg-2)] border border-[var(--warn-border)]',
		muted: 'bg-transparent text-[var(--muted)] border border-[var(--border)]'
	};
</script>

<span
	class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {variants[
		variant
	]} {className}"
>
	{@render children()}
</span>
