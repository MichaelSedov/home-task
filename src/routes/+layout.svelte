<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Toast from '$lib/ui/primitives/Toast.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		// Defer observability init off the critical path — both the module and
		// web-vitals itself are dynamically imported, so they never appear in
		// the entry chunk that gates first paint.
		const schedule =
			'requestIdleCallback' in window
				? window.requestIdleCallback
				: (cb: () => void) => setTimeout(cb, 1);
		schedule(async () => {
			const { initVitals, initErrorReporter } = await import('$lib/obs/vitals.js');
			initVitals();
			initErrorReporter();
		});
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<Toast />
