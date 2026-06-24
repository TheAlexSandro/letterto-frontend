<script lang="ts">
	import { onMount } from 'svelte';

	let menuOpen = $state(false);
	let dropdownOpen = $state(false);
	let dropdownOther = $state(false);
	let isLog = $state(false);
	let load = $state(false);
	let isAdmin = $state(false);

	onMount(async () => {
		const isLoggedIn = await fetch('/api/req?path=user&ep=accountInfo');
		const data = (await isLoggedIn.json()) as App.Platform['resp'];
		isAdmin = ['admin', 'owner'].includes(data.data['role']);
		isLog = data['status_code'] !== 200 ? false : true;
	});

	const toggleDropdown = (target: string) => {
		if (target === 'dash') {
			dropdownOther = false;
			dropdownOpen = !dropdownOpen;
		}
		if (target === 'other') {
			dropdownOpen = false;
			dropdownOther = !dropdownOther;
		}
	};

	const closeDropdown = () => {
		dropdownOpen = false;
	};

	const closeAll = () => {
		menuOpen = false;
		dropdownOpen = false;
	};

	const logout = async (e: Event) => {
		if (load) return;
		e.stopPropagation();
		const c = window.confirm('Are you sure you want to logout?');
		if (c) {
			load = true;
			await fetch('/api/req?path=user&ep=logout', {
				method: 'POST'
			});
			window.location.href = '/';
		}
	};
</script>

<svelte:window
	onclick={(e) => {
		const target = e.target as HTMLElement;
		if (!target.closest('.dropdown') && !target.closest('.hamburger')) {
			dropdownOpen = false;
			dropdownOther = false;
		}
		if (!target.closest('.mobile-menu') && !target.closest('.hamburger')) {
			menuOpen = false;
		}
	}}
/>

<section class="navbar">
	<div class="logo">
		<a href="/">LetterTo</a>
	</div>

	<div class="menu desktop">
		<a href="/#features" class="m">Features</a>

		<div class="dropdown">
			<button class="button" onclick={() => toggleDropdown('other')} aria-expanded={dropdownOther}>
				Other
				<i class={dropdownOther ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}></i>
			</button>

			{#if dropdownOther}
				<div class="dropdown-menu">
					<a href="https://t.me/kcpix" target="_blank" onclick={closeDropdown}>
						<i class="ri-customer-service-2-line"></i> Support
					</a>
				</div>
			{/if}
		</div>

		<div class="dropdown">
			<button
				class="button"
				onclick={() => toggleDropdown('dash')}
				aria-expanded={dropdownOpen}
				aria-labelledby="user"
			>
				<div class="user">
					<i class="ri-user-3-line"></i>
				</div>
				<i class={dropdownOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}></i>
			</button>

			{#if dropdownOpen}
				<div class="dropdown-menu">
					{#if !isLog}
						<a href="/auth?redirect=dashboard" onclick={closeDropdown}>
							<i class="ri-login-circle-line"></i> Login
						</a>
					{:else}
						<a href="/new" class="m" onclick={closeDropdown}
							><i class="ri-add-circle-line"></i> New Letter</a
						>
						<a href="/dashboard" onclick={closeDropdown}>
							<i class="ri-mail-line"></i> My Letters
						</a>
						<a href="/dashboard/settings" onclick={closeDropdown}>
							<i class="ri-settings-line"></i> Settings
						</a>
						{#if isAdmin}
							<a href="/dashboard/admin" onclick={closeDropdown}>
								<i class="ri-user-settings-line"></i> Admin
							</a>
						{/if}
						<a style="color: var(--color-danger);" onclick={logout} href="#logout">
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

		<div class="mobile-dropdown-section">
			<span class="mobile-dropdown-label">Other</span>
			<a href="https://t.me/kcpix" target="_blank" onclick={closeAll}>
				<i class="ri-customer-service-2-line"></i> Support
			</a>
		</div>

		<div class="mobile-dropdown-section">
			<span class="mobile-dropdown-label">Dashboard</span>
			{#if !isLog}
				<a href="/auth?redirect=dashboard" onclick={closeAll}>
					<i class="ri-login-circle-line"></i> Login
				</a>
			{:else}
				<a href="/new" class="m" onclick={closeAll}>
					<i class="ri-add-circle-line"></i> New Letter
				</a>
				<a href="/dashboard" onclick={closeAll}>
					<i class="ri-mail-line"></i> My Letters
				</a>
				<a href="/dashboard/settings" onclick={closeAll}>
					<i class="ri-settings-line"></i> Settings
				</a>
				{#if isAdmin}
					<a href="/dashboard/admin" onclick={closeAll}>
						<i class="ri-user-settings-line"></i> Admin
					</a>
				{/if}
				<a style="color: var(--color-danger);" href="#logout" onclick={logout}>
					{#if load}
						<span class="button-spinner"></span>
					{:else}
						<i class="ri-logout-circle-line"></i> Logout
					{/if}
				</a>
			{/if}
		</div>
	</div>
{/if}

<style>
	.navbar {
		position: fixed;
		top: 16px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 999;
		background: white;
		width: calc(100% - 48px);
		max-width: 1240px;
		height: 60px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 20px;
		border-radius: 14px;
		box-shadow:
			0 4px 24px rgba(0, 0, 0, 0.08),
			0 1px 4px rgba(0, 0, 0, 0.06);
		border: 1px solid rgba(0, 0, 0, 0.06);
	}

	.navbar .logo a {
		font-weight: var(--font-bold);
		font-size: 1.4rem;
		color: #333;
		text-decoration: none;
		font-family: 'Playwrite NZ Guides', cursive;
		font-weight: 400;
		font-style: normal;
	}

	.navbar .menu {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.navbar .menu a {
		text-decoration: none;
		color: var(--color-menu);
		font-weight: var(--font-medium);
		transition: color 0.2s ease;
		font-size: 15px;
		padding: 6px 12px;
		border-radius: 8px;
	}

	.navbar .button-spinner,
	.mobile-menu .button-spinner {
		margin: 0 auto;
		width: 18px;
		height: 18px;
		border: 2px solid transparent;
		border-top-color: var(--color-accent);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.navbar .menu .m:hover {
		color: var(--color-primary);
		background: var(--color-primary-light);
	}

	.navbar .menu .button {
		display: flex;
		align-items: center;
		gap: 6px;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		font-size: 15px;
		font-family: inherit;
		color: var(--color-menu);
		font-weight: var(--font-medium);
		background: transparent;
		transition:
			color 0.2s ease,
			background 0.2s ease;
		padding: 6px;
		height: 36px;
	}

	.navbar .menu button:hover {
		color: var(--color-primary);
		background: var(--color-primary-light);
	}

	.navbar .menu button .user i {
		font-size: 17px;
		display: block;
		margin-right: -6px;
	}

	.navbar .dropdown {
		position: relative;
	}

	.navbar .dropdown-menu {
		position: absolute;
		top: calc(100% + 8px);
		right: 0;
		background: #fff;
		border-radius: 10px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
		border: 1px solid rgba(0, 0, 0, 0.06);
		min-width: 160px;
		overflow: hidden;
		z-index: 1000;
		animation: fadeDown 0.15s ease;
		padding: 10px;
	}

	@keyframes fadeDown {
		from {
			opacity: 0;
			transform: translateY(-6px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.navbar .dropdown-menu a {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 7px 10px;
		color: var(--color-menu);
		font-size: 14px;
		font-weight: var(--font-medium);
		text-decoration: none;
		transition: background 0.15s ease;
	}

	.navbar .dropdown-menu a:hover {
		background: var(--color-primary-light);
		color: var(--color-primary);
	}

	.navbar .dropdown-menu a i {
		font-size: 16px;
		opacity: 0.75;
	}

	.hamburger {
		display: none;
		background: none;
		border: none;
		font-size: 1.4rem;
		cursor: pointer;
		color: var(--color-menu);
		width: 36px;
		height: 36px;
		border-radius: 8px;
		align-items: center;
		justify-content: center;
		transition: background 0.2s ease;
	}

	.hamburger:hover {
		background: var(--color-primary-light);
		color: var(--color-primary);
	}

	.mobile-menu {
		display: none;
		position: fixed;
		top: 84px;
		left: 50%;
		transform: translateX(-50%);
		width: calc(100% - 48px);
		max-width: 1240px;
		background: #fff;
		flex-direction: column;
		padding: 12px 16px;
		gap: 0;
		border-radius: 14px;
		box-shadow: 0 8px 28px rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(0, 0, 0, 0.06);
		z-index: 998;
		animation: fadeDown 0.15s ease;
	}

	.mobile-menu a {
		display: flex;
		align-items: center;
		text-decoration: none;
		color: var(--color-menu);
		font-weight: var(--font-medium);
		padding: 10px 8px;
		border-bottom: 1px solid var(--color-border);
		gap: 8px;
		font-size: 15px;
		transition:
			background 0.15s ease,
			color 0.15s ease;
	}

	.mobile-menu a:hover {
		background: var(--color-primary-light);
		color: var(--color-primary);
	}

	.mobile-menu a i {
		font-size: 16px;
		opacity: 0.7;
	}

	.mobile-dropdown-section {
		display: flex;
		flex-direction: column;
	}

	.mobile-dropdown-label {
		font-size: 11px;
		font-weight: var(--font-semibold);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #aaa;
		padding: 12px 8px 4px;
	}

	.mobile-dropdown-section a {
		display: flex;
		align-items: center;
		gap: 8px;
		text-decoration: none;
		color: var(--color-menu);
		font-weight: var(--font-medium);
		padding: 10px 8px;
		border-bottom: 1px solid var(--color-border);
		font-size: 14px;
		transition:
			background 0.15s ease,
			color 0.15s ease;
	}

	.mobile-dropdown-section a:hover {
		background: var(--color-primary-light);
		color: var(--color-primary);
	}

	.mobile-dropdown-section a i {
		font-size: 16px;
		opacity: 0.7;
	}

	@media (max-width: 1024px) and (min-width: 768px) {
		.navbar {
			width: calc(100% - 32px);
			padding: 0 16px;
		}

		.navbar .menu a,
		.navbar .menu .button {
			font-size: 13px;
			padding: 6px 8px;
		}
	}

	@media (max-width: 767px) {
		.navbar {
			width: calc(100% - 24px);
			top: 10px;
			padding: 0 14px;
			height: 52px;
		}

		.hamburger {
			display: flex;
		}

		.menu.desktop {
			display: none;
		}

		.mobile-menu {
			display: flex;
			top: 74px;
			width: calc(100% - 24px);
		}
	}
</style>
