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

	// Pick ink colour by computing actual WCAG contrast against the background.
	// Some avatarColor values from mocks (e.g. #a855f7) are mid-purple — white
	// gives ~4.0 contrast which fails AA on small text. Black gives ~5+.
	function relativeLuminance(hex: string): number {
		const clean = hex.replace('#', '');
		const rgb =
			clean.length === 3
				? clean.split('').map((c) => parseInt(c + c, 16))
				: [
						parseInt(clean.slice(0, 2), 16),
						parseInt(clean.slice(2, 4), 16),
						parseInt(clean.slice(4, 6), 16)
					];
		const [r, g, b] = rgb.map((v) => {
			const s = v / 255;
			return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
		});
		return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	}

	function contrast(a: number, b: number): number {
		const [hi, lo] = a > b ? [a, b] : [b, a];
		return (hi + 0.05) / (lo + 0.05);
	}

	const ink = $derived(
		(() => {
			const bg = relativeLuminance(color);
			const white = 1;
			const black = 0;
			// Prefer whichever ink hits 4.5:1; fall back to the better one.
			const cWhite = contrast(bg, white);
			const cBlack = contrast(bg, black);
			return cBlack >= cWhite ? '#0c0c14' : '#ffffff';
		})()
	);
</script>

<span
	class="inline-flex shrink-0 items-center justify-center rounded-full font-semibold {sizes[
		size
	]} {className}"
	style="background-color: {color}; color: {ink}"
	aria-hidden="true"
	title={name}
>
	{initials}
</span>
