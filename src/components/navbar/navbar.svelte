<script lang="ts">
	import { onMount } from 'svelte';
	import './page.css';

	let menuOpen = $state(false);
	let dropdownOpen = $state(false);
	let isLog = $state(false);
	let load = $state(false);

	onMount(async () => {
		const isLoggedIn = await fetch('/api/auth?path=accountInfo');
		const data = await isLoggedIn.json() as App.Platform['resp'];

		isLog = data['status_code'] !== 200 ? false : true;
	});

	const toggleDropdown = () => {
		dropdownOpen = !dropdownOpen;
	};

	const closeDropdown = () => {
		dropdownOpen = false;
	};

	const closeAll = () => {
		menuOpen = false;
		dropdownOpen = false;
	};

	const logout = async() => {
		const c = window.confirm('Are you sure you want to logout?');
		if (c) {
			load = true;
			await fetch('/api/user?path=logout')
			window.location.href = '/';
		}
	};
</script>

<svelte:window
	onclick={(e) => {
		const target = e.target as HTMLElement;
		if (!target.closest('.dropdown')) dropdownOpen = false;
	}}
/>

<section class="navbar">
	<div class="logo">
		<a href="/">LetterTo</a>
	</div>

	<div class="menu desktop">
		<a href="/#features" class="m">Features</a>
		<a href="/new" class="m">New Letter</a>

		<div class="dropdown">
			<button class="button" onclick={toggleDropdown} aria-expanded={dropdownOpen}>
				Dashboard
				<i class={dropdownOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}></i>
			</button>

			{#if dropdownOpen}
				<div class="dropdown-menu">
					{#if !isLog}
						<a href="/auth" onclick={closeDropdown}>
							<i class="ri-user-3-line"></i> Login
						</a>
					{:else}
						<a href="/dashboard/settings" onclick={closeDropdown}>
							<i class="ri-settings-line"></i> Settings
						</a>
						<a href="/dashboard/my-letters" onclick={closeDropdown}>
							<i class="ri-mail-line"></i> My Letters
						</a>
						<a class="red" onclick={logout} href="#logout">
							{#if load}
								<span class="button-spinner"></span>
							{:else}
								<i class="ri-logout-circle-line"></i> Logout
							{/if}
						</a>
					{/if}
				</div>
			{/if}
		</div>
	</div>

	<button class="hamburger" aria-labelledby="hamburger-menu" onclick={() => (menuOpen = !menuOpen)}>
		<i class={menuOpen ? 'ri-close-line' : 'ri-menu-line'}></i>
	</button>
</section>

{#if menuOpen}
	<div class="mobile-menu">
		<a href="/#features" class="m" onclick={closeAll}>Features</a>
		<a href="/new" class="m" onclick={closeAll}>New Letter</a>
		<div class="mobile-dropdown-section">
			<span class="mobile-dropdown-label">Dashboard</span>
			{#if !isLog}
				<a href="/auth" onclick={closeAll}>
					<i class="ri-user-3-line"></i> Login
				</a>
			{:else}
				<a href="/dashboard/settings" onclick={closeAll}>
					<i class="ri-settings-line"></i> Settings
				</a>
				<a href="/dashboard/my-letters" onclick={closeAll}>
					<i class="ri-mail-line"></i> My Letters
				</a>
				<a class="red" href="/dashboard/logout" onclick={closeAll}>
					<i class="ri-logout-circle-line"></i> Logout
				</a>
			{/if}
		</div>
	</div>
{/if}
