<script lang="ts">
	import Avatar from '$lib/ui/primitives/Avatar.svelte';
	import { getT, getLang } from '$lib/i18n/context.js';
	import { formatDate } from '$lib/i18n/t.js';

	interface Props {
		author: { name: string; avatarColor: string };
		publishedAt: string;
		readingTimeMinutes: number;
		variant?: 'inline' | 'stacked';
	}

	let { author, publishedAt, readingTimeMinutes, variant = 'inline' }: Props = $props();

	const t = getT();
	const lang = getLang();
	const date = $derived(formatDate(publishedAt, lang));
	const reading = $derived(t('blog.readingTime', { minutes: String(readingTimeMinutes) }));
</script>

{#if variant === 'inline'}
	<div class="flex flex-wrap items-center gap-2 text-[11px] text-muted">
		<Avatar name={author.name} color={author.avatarColor} size="sm" />
		<span>{author.name}</span>
		<span aria-hidden="true">·</span>
		<time datetime={publishedAt}>{date}</time>
		<span aria-hidden="true">·</span>
		<span>{reading}</span>
	</div>
{:else}
	<div class="flex items-center gap-3 text-sm text-muted">
		<Avatar name={author.name} color={author.avatarColor} size="md" />
		<div>
			<p class="font-medium text-fg-2">{author.name}</p>
			<p>
				<time datetime={publishedAt}>{date}</time>
				<span aria-hidden="true">·</span>
				{reading}
			</p>
		</div>
	</div>
{/if}
