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
	<meta
		name="description"
		content="LetterTo lets you create and send letters to anyone with plenty of customization options—and it's completely free!"
	/>
	<meta name="keywords" content="letterto, letter to, confess" />
	<meta name="author" content="Letter To" />

	<meta property="og:type" content="website" />
	<meta property="og:image" content={favicon} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:site_name" content="LetterTo" />
	<meta property="og:locale" content="en_US" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta
		name="twitter:description"
		content="LetterTo lets you create and send letters to anyone with plenty of customization options—and it's completely free!"
	/>
	<meta name="twitter:image" content={favicon} />
	<meta name="twitter:image:alt" content="Icon" />
</svelte:head>

{#if loading}
	<div class="preloader">
		<div class="spinner"></div>
	</div>
{/if}

{@render children()}
