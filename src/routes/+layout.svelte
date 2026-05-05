<script lang="ts">
	import favicon from '$lib/assets/favicon.png';
	import './global.css';
	import { afterNavigate } from '$app/navigation';
	import { onMount } from 'svelte';

	let loading = $state(true);

	onMount(() => {
		afterNavigate(() => {
			loading = false;
		});
	});

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>LetterTo</title>
</svelte:head>

{#if loading}
	<div class="preloader">
		<div class="spinner"></div>
	</div>
{/if}

{@render children()}
