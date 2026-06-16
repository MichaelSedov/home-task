<script lang="ts">
	interface Props {
		name: string;
		color?: string;
		size?: 'sm' | 'md' | 'lg';
		class?: string;
	}

	let { name, color = '#6d28d9', size = 'md', class: className = '' }: Props = $props();

	const initials = $derived(
		name
			.split(' ')
			.map((w) => w[0])
			.join('')
			.slice(0, 2)
			.toUpperCase()
	);

	const sizes = { sm: 'w-6 h-6 text-xs', md: 'w-8 h-8 text-sm', lg: 'w-10 h-10 text-base' };
</script>

<span
	class="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white {sizes[
		size
	]} {className}"
	style="background-color: {color}"
	aria-hidden="true"
	title={name}
>
	{initials}
</span>
