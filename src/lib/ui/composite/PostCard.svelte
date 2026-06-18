<script lang="ts">
	import { getLang } from '$lib/i18n/context.js';
	import Byline from './Byline.svelte';
	import PostTagList from './PostTagList.svelte';

	interface PostSummary {
		slug: string;
		title: string;
		excerpt: string;
		tags: string[];
		author: { name: string; avatarColor: string };
		publishedAt: string;
		readingTimeMinutes: number;
		coverColor: string;
	}

	interface Props {
		post: PostSummary;
		maxTags?: number;
	}

	let { post, maxTags = 3 }: Props = $props();
	const lang = getLang();
</script>

<a
	href="/{lang}/blog/{post.slug}"
	class="post-card group flex flex-col overflow-hidden rounded-[var(--radius-md)] border border-border bg-bg-elev transition-all duration-200 hover:-translate-y-[3px] hover:border-border-strong hover:shadow-md"
>
	<div class="post-cover" style="--cover-color: {post.coverColor}" aria-hidden="true"></div>

	<div class="flex flex-1 flex-col p-3.5">
		<PostTagList tags={post.tags} variant="chip" max={maxTags} />

		<h2 class="mb-1.5 text-[14px] font-semibold leading-[1.35] tracking-[-0.005em] text-fg">
			{post.title}
		</h2>

		<p class="mb-2.5 line-clamp-3 text-[12.5px] leading-[1.5] text-muted">
			{post.excerpt}
		</p>

		<div class="mt-auto">
			<Byline
				author={post.author}
				publishedAt={post.publishedAt}
				readingTimeMinutes={post.readingTimeMinutes}
				variant="inline"
			/>
		</div>
	</div>
</a>

<style>
	.post-cover {
		height: 70px;
		flex-shrink: 0;
		background: linear-gradient(
			135deg,
			var(--cover-color),
			color-mix(in oklab, var(--cover-color) 60%, black)
		);
	}
</style>
