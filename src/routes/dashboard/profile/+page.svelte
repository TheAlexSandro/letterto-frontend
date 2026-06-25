<script lang="ts">
	import Navbar from '../../../components/navbar/navbar.svelte';
	import Footer from '../../../components/footer/footer.svelte';
	import { onMount } from 'svelte';
	import '../profile.css';
	import { showToast } from '$lib/toast';
	import { isLoggedIn } from '$lib/utils/utils';

	let windowLoad = $state(true);
	let username = $state('');
	let name = $state('');

	let usernameD = $state('');
	let nameD = $state('');

	let buttonLoad = $state(false);
	let usernameErr = $state('');
	let noChange = $state(true);
	let globalErr = $state('');

	onMount(async () => {
		const loggedIn = await isLoggedIn();
		if (loggedIn === 'error') {
			showToast('Something went wrong, please try again later.', 'error', 5000);
			return;
		}
		if (!loggedIn) {
			window.location.href = '/auth?redirect=dashboard/profile';
			return;
		}

		name = loggedIn.name;
		username = loggedIn.username;
		nameD = loggedIn.name;
		usernameD = loggedIn.username;
		windowLoad = false;
	});

	const getInitial = (name?: string) => name?.charAt(0).toUpperCase() ?? '?';

	const onChangeHandle = () => {
		if (name == nameD && username == usernameD) {
			noChange = true;
			return;
		}
		noChange = false;
	};

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		buttonLoad = true;
		noChange = false;
		usernameErr = '';
		try {
			const ft = await fetch(`/api/req?path=user&ep=edit`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ name, username })
			});
			if (!ft.ok) {
				buttonLoad = false;
				globalErr = 'Something went wrong, please try again later.';
				return;
			}
			const ftJson = (await ft.json()) as App.Platform['resp'];

			if (ftJson['status_code'] !== 200) {
				if (ftJson['error_code'] === 'UNAUTHORIZED') {
					window.location.href = '/auth?redirect=dashboard/profile';
					return;
				}
				usernameErr = ftJson['error_code'] === 'ID_OCCUPIED' ? ftJson['message'] : '';
				globalErr = ['BAD_REQUEST', 'BANNED'].includes(ftJson['error_code']) ? ftJson['message'] : '';
				buttonLoad = false;
			} else {
				window.location.reload();
			}
		} catch {
			buttonLoad = false;
			globalErr = 'Something went wrong, please try again later.';
		}
	};

	const returns = () => {
		window.location.href = '/dashboard/settings';
	};
</script>

<svelte:head>
	<title>LetterTo - My Profile</title>
	<meta property="og:url" content="/dashboard/profile" />
	<meta property="og:title" content="LetterTo - My Profile" />
	<meta name="twitter:title" content="LetterTo - My Profile" />
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
				<div class="avatar">{getInitial(name)}</div>
				<form method="post" onsubmit={handleSubmit}>
					<label for="name">Your Name</label>
					<input
						type="text"
						id="name"
						placeholder="Alex Johnson"
						required
						bind:value={name}
						disabled={buttonLoad}
						oninput={onChangeHandle}
					/>
					<label for="username">Username</label>
					<input
						type="text"
						id="username"
						placeholder="alexjohnson_"
						required
						bind:value={username}
						disabled={buttonLoad}
						oninput={onChangeHandle}
					/>
					{#if usernameErr}
						<span>{usernameErr}</span>
					{/if}

					{#if globalErr}
						<div class="error">
							{globalErr}
						</div>
					{/if}

					<div class="btns">
						<button
							disabled={buttonLoad || noChange}
							id={noChange ? 'dis' : buttonLoad ? 'fill' : 'fill'}
						>
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
