<script lang="ts">
	import Navbar from '../../../components/navbar/navbar.svelte';
	import Footer from '../../../components/footer/footer.svelte';
	import { onMount } from 'svelte';
	import '../page.css';

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
		const isLoggedIn = await fetch('/api/auth?path=accountInfo');
		const data = await isLoggedIn.json() as App.Platform['resp'];

		if (data['status_code'] !== 200) {
			window.location.href = '/auth';
			return;
		}

		name = data['data']['name'];
		username = data['data']['username'];
		nameD = data['data']['name'];
		usernameD = data['data']['username'];
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
		const ft = await fetch(`/api/user?path=edit&name=${name}&username=${username}`);
		const ftJson = await ft.json() as App.Platform['resp'];

		if (ftJson['status_code'] !== 200) {
			if (ftJson['error_code'] === 'UNAUTHORIZED') {
				window.location.href = '/auth';
				return;
			}
			usernameErr = ftJson['error_code'] === 'ID_OCCUPIED' ? ftJson['message'] : '';
			globalErr = ftJson['error_code'] === '' ? ftJson['message'] : '';
			buttonLoad = false;
		} else {
			window.location.reload();
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
