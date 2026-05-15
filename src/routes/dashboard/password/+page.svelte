<script lang="ts">
	import Navbar from '../../../components/navbar/navbar.svelte';
	import Footer from '../../../components/footer/footer.svelte';
	import { onMount } from 'svelte';
	import '../page.css';

	let windowLoad = $state(true);
	let new_password = $state('');
	let old_password = $state('');

	let buttonLoad = $state(false);
	let globalErr = $state('');
	let passErr = $state('');
	let oldPassErr = $state('');
	let showPass = $state(false);

	onMount(async () => {
		const isLoggedIn = await fetch('/api/req?path=auth&ep=accountInfo');
		const data = (await isLoggedIn.json()) as App.Platform['resp'];

		if (data['status_code'] !== 200) {
			window.location.href = '/auth?redirect=dashboard/password';
			return;
		}

		windowLoad = false;
	});

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		buttonLoad = true;
		oldPassErr = '';
		passErr = '';
		const ft = await fetch(`/api/req?path=user&ep=edit`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ old_password, new_password })
		});
		const ftJson = (await ft.json()) as App.Platform['resp'];

		if (ftJson['status_code'] !== 200) {
			if (ftJson['error_code'] === 'UNAUTHORIZED') {
				window.location.href = '/auth?redirect=dashboard/password';
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
					<label for="message">Current Password</label>
					<input
						type={showPass ? 'text' : 'password'}
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
					<label for="message">New Password</label>
					<input
						type={showPass ? 'text' : 'password'}
						name="password"
						id="password"
						placeholder="••••••••"
						required
						bind:value={new_password}
						disabled={buttonLoad}
					/>
					{#if passErr}
						<span>{passErr}</span>
					{/if}
					<div class="checkbox-container">
						<input
							type="checkbox"
							id="view"
							onchange={() => {
								showPass = !showPass;
							}}
							checked={showPass}
						/>
						<div class="custom-checkmark"></div>
						<p class="status-text">{showPass ? 'Hide password' : 'Show password'}</p>
					</div>

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
