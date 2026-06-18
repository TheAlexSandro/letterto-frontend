<script>
	import { page } from '$app/state';
	import './global.css';
	import { PUBLIC_ASSETS_STORAGE } from '$env/static/public';
</script>

<svelte:head>
	<!-- Favicon -->
	<link rel="icon" href="{PUBLIC_ASSETS_STORAGE}/favicon.ico" sizes="any" />
	<link rel="icon" href="{PUBLIC_ASSETS_STORAGE}/favicon.svg" type="image/svg+xml" />
	<link rel="apple-touch-icon" href="{PUBLIC_ASSETS_STORAGE}/apple-touch-icon.png" />
	<link rel="manifest" href="{PUBLIC_ASSETS_STORAGE}/site.webmanifest" />
</svelte:head>

<div class="error-container">
	{#if page.status === 404}
		<h1>404</h1>
		<p>Sorry, the page you are looking for does not exist.</p>
	{:else}
		<h1>Error {page.status}</h1>
		<p>Something went wrong...</p>
	{/if}

	<a href="/">Return Home</a>
</div>

<style>
	.error-container {
		text-align: center;
		padding: 4rem 2rem;
	}
    
    .error-container a {
        display: block;
        margin-top: 20px;
    }
</style>
