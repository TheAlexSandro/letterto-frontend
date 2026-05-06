<script lang="ts">
	import Navbar from '../../../components/navbar/navbar.svelte';
	import Footer from '../../../components/footer/footer.svelte';
	import { onMount } from 'svelte';
	import './page.css';

	type Nav = 'profile' | 'passwd';

	let windowLoad = $state(true);

	onMount(async () => {
		const isLoggedIn = await fetch('/api/auth?path=accountInfo');
		const data = await isLoggedIn.json() as App.Platform['resp'];

		if (data['status_code'] !== 200) {
			window.location.href = '/auth';
			return;
		}

		windowLoad = false;
	});

	const goNav = (to: Nav) => {
		if (to === 'profile') {
			window.location.href = '/dashboard/profile';
		}

		if (to === 'passwd') {
			window.location.href = '/dashboard/password';
		}
	};
</script>

<svelte:head>
	<title>LetterTo - Settings</title>
	<meta property="og:url" content="/dashboard/settings" />
	<meta property="og:title" content="LetterTo - Settings" />
	<meta name="twitter:title" content="LetterTo - Settings" />
</svelte:head>

{#if windowLoad}
	<div class="preloader">
		<div class="spinner"></div>
	</div>
{:else}
	<Navbar />

	<section class="settings">
		<div class="container">
			<div class="desc">
				<h1>My Settings</h1>
				<p>Choose what you want to manage here...</p>
			</div>

			<div class="menu">
				<h1>Profile</h1>
				<button class="item" onclick={() => goNav('profile')}>
					<span class="left"><i class="ri-user-3-line"></i> My Profile</span>
					<span class="right"><i class="ri-arrow-right-s-line"></i></span>
				</button>
			</div>

			<div class="menu">
				<h1>Settings</h1>
				<button class="item" onclick={() => goNav('passwd')}>
					<span class="left"><i class="ri-door-lock-line"></i> Change Password</span>
					<span class="right"><i class="ri-arrow-right-s-line"></i></span>
				</button>
			</div>
		</div>
	</section>

	<Footer />
{/if}
