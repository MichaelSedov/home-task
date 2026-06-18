<script lang="ts">
	function toggleTheme() {
		const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
		document.documentElement.setAttribute('data-theme', next);
		document.cookie = `theme=${next};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
	}
</script>

<button
	onclick={toggleTheme}
	aria-label="Toggle theme"
	class="rounded-lg p-1.5 text-[var(--muted)] transition-colors hover:bg-[var(--bg-soft)] hover:text-[var(--fg)]"
>
	<svg
		width="16"
		height="16"
		viewBox="0 0 16 16"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
	>
		<circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5" />
		<path d="M8 1v14M8 1a7 7 0 0 0 0 14" fill="currentColor" opacity=".35" />
	</svg>
</button>
