<script lang="ts">
	import Badge from '$lib/ui/primitives/Badge.svelte';
	import { getLang } from '$lib/i18n/context.js';
	import { getTagLabel } from '$lib/i18n/dict.js';

	interface Props {
		tags: string[];
		/** 'chip' — small inline chips for card grids; 'badge' — linked Badge for the post page. */
		variant?: 'chip' | 'badge';
		max?: number;
	}

	let { tags, variant = 'chip', max }: Props = $props();

	const lang = getLang();
	const visible = $derived(max ? tags.slice(0, max) : tags);
</script>

{#if visible.length > 0}
	{#if variant === 'chip'}
		<div class="mb-2 flex flex-wrap gap-1">
			{#each visible as tag (tag)}
				<span
					class="rounded-full border border-border bg-bg-soft px-[7px] py-[1.5px] text-[10.5px] font-semibold text-muted"
				>
					{getTagLabel(tag, lang)}
				</span>
			{/each}
		</div>
	{:else}
		<nav aria-label="Post tags" class="mb-4 flex flex-wrap gap-2">
			{#each visible as tag (tag)}
				<a href="/{lang}/search?tag={tag}">
					<Badge variant="muted">{getTagLabel(tag, lang)}</Badge>
				</a>
			{/each}
		</nav>
	{/if}
{/if}
