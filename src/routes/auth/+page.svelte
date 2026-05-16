<script lang="ts">
	import type { PageData } from './$types';
	import Navbar from '../../components/navbar/navbar.svelte';
	import Footer from '../../components/footer/footer.svelte';
	import './page.css';
	import { onMount } from 'svelte';

	type Auth = 'signUp' | 'signIn';

	let { data }: { data: PageData } = $props();
	let signUp: boolean = $state(false);
	let windowLoad = $state(true);
	let name = $state('');
	let username = $state('');
	let password = $state('');
	let globalErr = $state('');
	let usernameErr = $state('');
	let passwordErr = $state('');
	let nameErr = $state('');
	let buttonLoad = $state(false);

	onMount(async () => {
		const isLoggedIn = await fetch('/api/req?path=auth&ep=accountInfo');
		const data = (await isLoggedIn.json()) as App.Platform['resp'];

		if (data['status_code'] === 200) {
			window.location.href = '/dashboard/my-letters';
			return;
		}
		windowLoad = false;
	});

	const handleAuthType = () => {
		globalErr = '';
		usernameErr = '';
		passwordErr = '';
		signUp = !signUp;
	};

	const handleAuth = async (type: Auth, e: Event) => {
		e.preventDefault();
		buttonLoad = true;
		globalErr = '';
		usernameErr = '';
		passwordErr = '';
		try {
			const ft = await fetch(`/api/req?path=auth&ep=${type}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ name, username, password })
			});
			const datas = (await ft.json()) as App.Platform['resp'];

			if (datas['status_code'] !== 200) {
				globalErr = ['BAD_REQUEST', 'PARAMETER_EMPTY'].includes(datas['error_code'])
					? 'Something went wrong, please try again later.'
					: '';
				nameErr =
					datas['error_code'] === 'LENGTH_TOO_LONG' && datas['message'].includes('Name')
						? datas['message']
						: '';
				usernameErr =
					datas['error_code'] === 'USER_ALREADY_EXIST'
						? 'Username occupied.'
						: datas['error_code'] === 'USER_NOT_FOUND'
							? 'User not found.'
							: datas['error_code'] === 'LENGTH_TOO_LONG' && datas['message'].includes('Username')
								? datas['message']
								: datas['error_code'] === 'INVALID_FORMAT' && datas['message'].includes('Username')
									? datas['message']
									: '';
				passwordErr =
					datas['error_code'] === 'INVALID_PASSWORD'
						? 'Wrong password.'
						: ['LENGTH_TOO_SHORT', 'LENGTH_TOO_LONG'].includes(datas['error_code']) &&
							  datas['message'].includes('Password')
							? datas['message']
							: datas['error_code'] === 'INVALID_FORMAT' && datas['message'].includes('Password')
								? datas['message']
								: '';
				buttonLoad = false;
			} else {
				window.location.href = `/${data.redirect}`;
			}
		} catch {
			globalErr = 'Something went wrong, please try again later.';
		}
	};
</script>

<svelte:head>
	<title>LetterTo - Authentication</title>
	<meta property="og:url" content="/auth" />
	<meta property="og:title" content="LetterTo - Authentication" />
	<meta name="twitter:title" content="LetterTo - Authentication" />
</svelte:head>

{#if windowLoad}
	<div class="preloader">
		<div class="spinner"></div>
	</div>
{:else}
	<Navbar />
	<section class="auth">
		<div class="container">
			<div class="desc">
				<h1>Authentication</h1>
				<p>Sign in to create a letter...</p>
			</div>
			{#if globalErr}
				<div class="error">
					{globalErr}
				</div>
			{/if}
			<form method="post" onsubmit={(e) => handleAuth(signUp ? 'signUp' : 'signIn', e)}>
				{#if signUp}
					<label for="name">Your Name</label>
					<input
						type="text"
						id="name"
						placeholder="Alex Johnson"
						required
						bind:value={name}
						disabled={buttonLoad}
					/>
					{#if nameErr}
						<span>{nameErr}</span>
					{/if}
				{/if}
				<label for="username">Username</label>
				<input
					type="text"
					id="username"
					placeholder="alexjohnson_"
					required
					bind:value={username}
					disabled={buttonLoad}
				/>
				{#if usernameErr}
					<span>{usernameErr}</span>
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
				{#if passwordErr}
					<span>{passwordErr}</span>
				{/if}

				<div class="btns">
					<button
						disabled={buttonLoad}
						type="button"
						onclick={handleAuthType}
						class="button"
						id="out"
					>
						{signUp ? 'Have an account? Sign In!' : `Don't have an account? Sign Up`}
					</button>
					<button disabled={buttonLoad} type="submit" id="fill">
						{#if buttonLoad}
							<span class="button-spinner"></span>
						{:else}
							{signUp ? 'Sign Up' : 'Sign In'}
						{/if}
					</button>
				</div>
			</form>
		</div>
	</section>

	<Footer />
{/if}
