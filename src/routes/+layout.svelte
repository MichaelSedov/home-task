<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import Toast from '$lib/ui/primitives/Toast.svelte';
	import { onMount } from 'svelte';
	import { initVitals, initErrorReporter } from '$lib/obs/vitals.js';

	let { children } = $props();

	onMount(() => {
		initVitals();
		initErrorReporter();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<Toast />
