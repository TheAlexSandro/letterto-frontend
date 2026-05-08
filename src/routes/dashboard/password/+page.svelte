<script lang="ts">
	import Navbar from '../../../components/navbar/navbar.svelte';
	import Footer from '../../../components/footer/footer.svelte';
	import { onMount } from 'svelte';
	import '../page.css';

	let windowLoad = $state(true);
	let password = $state('');
	let old_password = $state('');

	let buttonLoad = $state(false);
	let globalErr = $state('');
	let passErr = $state('');
	let oldPassErr = $state('');

	onMount(async () => {
		const isLoggedIn = await fetch('/api/auth?path=accountInfo');
		const data = await isLoggedIn.json() as App.Platform['resp'];

		if (data['status_code'] !== 200) {
			window.location.href = '/auth';
			return;
		}

		windowLoad = false;
	});

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		buttonLoad = true;
		oldPassErr = '';
		passErr = '';
		const ft = await fetch(`/api/user?path=edit&password=${password}&old_password=${old_password}`);
		const ftJson = await ft.json() as App.Platform['resp'];

		if (ftJson['status_code'] !== 200) {
			if (ftJson['error_code'] === 'UNAUTHORIZED') {
				window.location.href = '/auth';
				return;
			}
			oldPassErr = ftJson['error_code'] === 'INVALID_PASSWORD' ? 'Wrong old password.' : '';
			passErr = ftJson['error_code'] === 'LENGTH_TOO_SHORT' ? 'Minimum is 8 characters.' : '';
			globalErr = ftJson['error_code'] === '' ? ftJson['message'] : '';
			buttonLoad = false;
		} else {
			returns();
		}
	};

	const returns = () => {
		window.location.href = '/dashboard/settings';
	};
</script>

<svelte:head>
	<title>LetterTo - Change Password</title>
	<meta property="og:url" content="/dashboard/password" />
	<meta property="og:title" content="LetterTo - Change Password" />
	<meta name="twitter:title" content="LetterTo - Change Password" />
</svelte:head>

{#if windowLoad}
	<div class="preloader">
		<div class="spinner"></div>
	</div>
{:else}
	<Navbar />
	<section class="profile">
		<div class="container">
			<div class="return">
				<button type="button" aria-labelledby="return" onclick={returns}>
					<i class="ri-arrow-left-s-line"></i>
				</button>
			</div>

			<div class="box">
				<form method="post" onsubmit={handleSubmit}>
					<label for="message">Old Password</label>
					<input
						type="password"
						name="password"
						id="password"
						placeholder="••••••••"
						required
						bind:value={old_password}
						disabled={buttonLoad}
					/>
					{#if oldPassErr}
						<span>{oldPassErr}</span>
					{/if}
					<label for="message">Password</label>
					<input
						type="password"
						name="password"
						id="password"
						placeholder="••••••••"
						required
						bind:value={password}
						disabled={buttonLoad}
					/>
					{#if passErr}
						<span>{passErr}</span>
					{/if}

					{#if globalErr}
						<div class="error">
							{globalErr}
						</div>
					{/if}

					<div class="btns">
						<button disabled={buttonLoad} id="fill">
							{#if buttonLoad}
								<span class="button-spinner"></span>
							{:else}
								Save Changes
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>
	</section>
	<Footer />
{/if}
