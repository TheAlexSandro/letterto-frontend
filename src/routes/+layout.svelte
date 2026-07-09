<script lang="ts">
	import { page } from '$app/state';
	import {
		PUBLIC_ASSETS_STORAGE,
		PUBLIC_BANNER_HEAD,
		PUBLIC_BANNER_DESC,
		PUBLIC_BANNER_SHOW
	} from '$env/static/public';
	import './global.css';
	import { afterNavigate } from '$app/navigation';
	import Toast from '../components/toast/toast.svelte';
	import { toast } from '$lib/toast';

	let loading = $state(true);
	afterNavigate(() => {
		loading = false;
	});

	let { children } = $props();

	let showBanner = $state(String(PUBLIC_BANNER_SHOW) === 'true' ? true : false);
	let bannerEl = $state<HTMLElement>();
	let bannerHeight = $state(0);

	$effect(() => {
		if (!bannerEl) {
			bannerHeight = 0;
			return;
		}
		const observer = new ResizeObserver(([entry]) => {
			bannerHeight = entry.contentRect.height + 10;
		});
		observer.observe(bannerEl);
		return () => observer.disconnect();
	});

	$effect(() => {
		document.documentElement.style.setProperty('--banner-height', `${bannerHeight}px`);
	});
</script>

<svelte:head>
	<!-- Favicon -->
	<link rel="icon" href="{PUBLIC_ASSETS_STORAGE}/favicon.ico" sizes="any" />
	<link rel="icon" href="{PUBLIC_ASSETS_STORAGE}/favicon.svg" type="image/svg+xml" />
	<link rel="apple-touch-icon" href="{PUBLIC_ASSETS_STORAGE}/apple-touch-icon.png" />
	<link rel="manifest" href="{PUBLIC_ASSETS_STORAGE}/site.webmanifest" />

	<!-- Primary -->
	<title>LetterTo</title>
	<meta
		name="description"
		content="LetterTo lets you create and send letters to anyone with plenty of customization options—and it's completely free!"
	/>
	<meta name="keywords" content="letterto, letter to, confess" />
	<meta name="author" content="Letter To" />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content={page.url.href} />
	<meta property="og:title" content="LetterTo" />
	<meta
		property="og:description"
		content="LetterTo lets you create and send letters to anyone with plenty of customization options—and it's completely free!"
	/>
	<meta property="og:image" content="{PUBLIC_ASSETS_STORAGE}/web-app-manifest-512x512.png" />
	<meta property="og:image:width" content="512" />
	<meta property="og:image:height" content="512" />
	<meta property="og:image:alt" content="LetterTo - Send letters to anyone" />
	<meta property="og:site_name" content="LetterTo" />
	<meta property="og:locale" content="en_US" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="LetterTo" />
	<meta
		name="twitter:description"
		content="LetterTo lets you create and send letters to anyone with plenty of customization options—and it's completely free!"
	/>
	<meta name="twitter:image" content="{PUBLIC_ASSETS_STORAGE}/web-app-manifest-512x512.png" />
	<meta name="twitter:image:alt" content="LetterTo - Send letters to anyone" />
</svelte:head>

{#if showBanner}
	<div class="notif-banner" bind:this={bannerEl}>
		<div class="c">
			<i class="ri-alert-line"></i>
			<div class="desc">
				<span>{PUBLIC_BANNER_HEAD}</span>
				<p>
					{PUBLIC_BANNER_DESC}
				</p>
			</div>
		</div>
		<!-- <button class="close-btn" onclick={() => (showBanner = false)} aria-label="Tutup notifikasi">
			<i class="ri-close-line"></i>
		</button> -->
	</div>
{/if}

<Toast
	message={$toast.message}
	type={$toast.type as 'success' | 'error' | 'info' | 'warning'}
	show={$toast.show}
/>

{#if loading}
	<div class="preloader">
		<div class="spinner"></div>
	</div>
{/if}

<div style="padding-top: var(--banner-height, 0px);">
	{@render children()}
</div>

<style>
	:global(.ql-align-center) {
		text-align: center;
	}
	:global(.ql-align-right) {
		text-align: right;
	}
	:global(.ql-align-justify) {
		text-align: justify;
	}
	:global(.ql-disabled) {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
