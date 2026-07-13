<script lang="ts">
	import type { PageData } from './$types';
	import Navbar from '../../components/navbar/navbar.svelte';
	import Footer from '../../components/footer/footer.svelte';
	import './page.css';
	import { onMount } from 'svelte';
	import { showToast } from '$lib/toast';

	type Auth = 'signUp' | 'signIn';
	type Step = 'name' | 'username' | 'password';

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
	let showPassword = $state(false);
	let stepIndex = $state(0);

	let steps = $derived<Step[]>(
		signUp ? ['name', 'username', 'password'] : ['username', 'password']
	);
	let currentStep = $derived(steps[stepIndex]);
	let isLastStep = $derived(stepIndex === steps.length - 1);

	onMount(async () => {
		try {
			const isLoggedIn = await fetch('/api/req?path=user&ep=accountInfo');
			if (!isLoggedIn.ok) {
				showToast('Something went wrong, please try again later.', 'error', 5000);
				return;
			}
			const data = (await isLoggedIn.json()) as App.Platform['resp'];

			if (data['status_code'] === 200) {
				window.location.href = '/dashboard';
				return;
			}
		} catch {
			showToast('Something went wrong, please try again later.', 'error', 5000);
		}
		windowLoad = false;
	});

	const clearErrors = () => {
		globalErr = '';
		usernameErr = '';
		passwordErr = '';
		nameErr = '';
	};

	const handleAuthType = () => {
		clearErrors();
		signUp = !signUp;
		name = '';
		username = '';
		password = '';
		stepIndex = 0;
	};

	const handleAuth = async (type: Auth, e: Event) => {
		e.preventDefault();
		buttonLoad = true;
		clearErrors();
		try {
			const ft = await fetch(`/api/req?path=auth&ep=${type}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ name, username, password })
			});
			if (!ft.ok) {
				globalErr = 'Something went wrong, please try again later.';
				buttonLoad = false;
				return;
			}
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
						? 'Username occupied'
						: datas['error_code'] === 'USER_NOT_FOUND'
							? 'User not found'
							: datas['error_code'] === 'LENGTH_TOO_LONG' && datas['message'].includes('Username')
								? datas['message']
								: datas['error_code'] === 'INVALID_FORMAT' && datas['message'].includes('Username')
									? datas['message']
									: '';
				passwordErr =
					datas['error_code'] === 'INVALID_PASSWORD'
						? 'Invalid password'
						: ['LENGTH_TOO_SHORT', 'LENGTH_TOO_LONG'].includes(datas['error_code']) &&
							  datas['message'].includes('Password')
							? datas['message']
							: datas['error_code'] === 'INVALID_FORMAT' && datas['message'].includes('Password')
								? datas['message']
								: '';
				buttonLoad = false;

				if (usernameErr) stepIndex = steps.indexOf('username');
			} else {
				window.location.href = `/${data.redirect}`;
			}
		} catch {
			globalErr = 'Something went wrong, please try again later.';
			buttonLoad = false;
		}
	};

	const handleVerifyUsn = async (e: Event, method: string) => {
		e.preventDefault();
		buttonLoad = true;
		clearErrors();
		try {
			const ft = await fetch(`/api/req?path=auth&ep=verifyUsername`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ username, method })
			});
			if (!ft.ok) {
				globalErr = 'Something went wrong, please try again later.';
				buttonLoad = false;
				return;
			}
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
						? 'Username occupied'
						: datas['error_code'] === 'USER_NOT_FOUND'
							? 'User not found'
							: datas['error_code'] === 'LENGTH_TOO_LONG' && datas['message'].includes('Username')
								? datas['message']
								: datas['error_code'] === 'INVALID_FORMAT' && datas['message'].includes('Username')
									? datas['message']
									: '';
				buttonLoad = false;
				return;
			}

			stepIndex += 1;
			buttonLoad = false;
		} catch {
			globalErr = 'Something went wrong, please try again later.';
			buttonLoad = false;
		}
	};

	const goBack = () => {
		clearErrors();
		if (stepIndex > 0) stepIndex -= 1;
	};

	const handleNext = async (e: Event) => {
		e.preventDefault();
		clearErrors();

		if (currentStep === 'name' && name.trim().length === 0) {
			nameErr = 'Please input your name';
			return;
		}
		if (currentStep === 'username' && username.trim().length === 0) {
			usernameErr = 'Please input your username.';
			return;
		}
		if (currentStep === 'password' && password.length === 0) {
			passwordErr = 'Please input your password.';
			return;
		}

		if (currentStep === 'username') {
			await handleVerifyUsn(e, signUp ? 'signup' : 'signin');
		} else {
			if (isLastStep) {
				handleAuth(signUp ? 'signUp' : 'signIn', e);
			} else {
				stepIndex += 1;
			}
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
			<div class="card">
				<div class="desc">
					<h1>{signUp ? 'Sign Up' : 'Sign In'}</h1>
					<p>
						{signUp ? 'Create a new account' : 'Login to your account'}
					</p>
				</div>

				{#if globalErr}
					<div class="error">
						{globalErr}
					</div>
				{/if}

				<form onsubmit={handleNext}>
					{#if currentStep === 'name'}
						<div class="field-row" class:field-error={nameErr}>
							<label for="name">Your Name</label>
							<div class="input-wrap">
								<input
									type="text"
									name="name"
									id="name"
									bind:value={name}
									disabled={buttonLoad}
									placeholder="Alex Johnson"
								/>
							</div>
						</div>
						{#if nameErr}<span class="field-err">{nameErr}</span>{/if}
					{:else if currentStep === 'username'}
						<div class="field-row" class:field-error={usernameErr}>
							<label for="username">Username</label>
							<div class="input-wrap">
								<input
									type="text"
									name="username"
									id="username"
									bind:value={username}
									disabled={buttonLoad}
									autocomplete="username"
									placeholder="alexjonhson_"
								/>
							</div>
						</div>
						{#if usernameErr}<span class="field-err">{usernameErr}</span>{/if}
					{:else if currentStep === 'password'}
						<div class="field-row" class:field-error={passwordErr}>
							<label for="password">Password</label>
							<div class="input-wrap">
								<input
									type={showPassword ? 'text' : 'password'}
									name="password"
									id="password"
									bind:value={password}
									disabled={buttonLoad}
									autocomplete={signUp ? 'new-password' : 'current-password'}
									placeholder="your password"
								/>
								<button
									type="button"
									class="toggle-visibility"
									onclick={() => (showPassword = !showPassword)}
									tabindex="-1"
								>
									{showPassword ? 'Hide' : 'Show'}
								</button>
							</div>
						</div>
						{#if passwordErr}<span class="field-err">{passwordErr}</span>{/if}
					{/if}

					<div class="btns">
						{#if stepIndex === 0}
							<button type="button" id="out" onclick={handleAuthType} disabled={buttonLoad}>
								{signUp ? 'Sign In' : 'Create account'}
							</button>
						{:else}
							<button type="button" id="return" onclick={goBack} disabled={buttonLoad}>
								<i class="ri-arrow-left-s-line"></i> Return
							</button>
						{/if}

						<button type="submit" id="fill" disabled={buttonLoad}>
							{#if buttonLoad}
								<div class="button-spinner"></div>
							{:else if isLastStep}
								{signUp ? 'Create' : 'Sign In'}
							{:else}
								Next
							{/if}
						</button>
					</div>
				</form>
			</div>
		</div>
	</section>

	<Footer />
{/if}
