<script lang="ts">
	import Navbar from '../../components/navbar/navbar.svelte';
	import Footer from '../../components/footer/footer.svelte';
	import './page.css';
	import { onMount } from 'svelte';
	import Letter from '../../components/letter/letter.svelte';
	import { showToast } from '$lib/toast';
	import { isLoggedIn } from '$lib/utils/utils';

	type Card = {
		id: string;
		user_id: string;
		sender: string;
		message: string;
		created_at: string;
		font: string;
		recipient_name: string;
		music_profile: string;
		music_title: string;
		artist: string;
		warn: string;
	};

	let windowLoad = $state(true);
	let letterLoad = $state(true);
	let globalErr = $state('');
	let cards: Card[] = $state([]);
	let windowWidth = $state(0);
	let total = $state(0);
	let offset = $state(1);
	let isFetching = $state(false);
	let sentinel: HTMLElement | null = $state(null);
	let userRole = $state('');

	const fetchLetters = async () => {
		if (isFetching) return;
		if (cards.length >= total && total !== 0) return;

		isFetching = true;

		try {
			const ftLetter = await fetch(`/api/letters?path=myLetters&offset=${offset}`);
			if (!ftLetter.ok) {
				showToast('Failed to fetch letter, please try again.', 'error', 5000);
				return;
			}
			const dataLetter = (await ftLetter.json()) as App.Platform['resp'];

			if (dataLetter['status_code'] !== 200) {
				if (dataLetter['error_code'] === 'UNAUTHORIZED') {
					window.location.href = '/auth?redirect=dashboard';
					return;
				}
				globalErr =
					dataLetter['error_code'] === 'BAD_REQUEST'
						? `Something went wrong, please reload this page.`
						: ``;
			} else {
				cards = [...cards, ...dataLetter['data']];
				offset++;
			}

			isFetching = false;
			letterLoad = false;
		} catch {
			showToast('Failed to fetch letter, please try again.', 'error', 5000);
		}
	};

	onMount(() => {
		windowWidth = window.innerWidth;
		const handleResize = () => {
			windowWidth = window.innerWidth;
		};
		window.addEventListener('resize', handleResize);

		(async () => {
			const loggedIn = await isLoggedIn();
			if (loggedIn === 'error') {
				showToast('Something went wrong, please try again later.', 'error', 5000);
				return;
			}
			if (!loggedIn) {
				window.location.href = '/auth';
				return;
			}

			userRole = loggedIn.role;
			windowLoad = false;
			const ftT = await fetch('/api/letters?path=total');
			if (!ftT.ok) {
				showToast('Failed to fetch total.', 'error', 5000);
				return;
			}
			const dT = (await ftT.json()) as App.Platform['resp'];
			total = dT['data']['total'];
			await fetchLetters();
			const observer = new IntersectionObserver(
				(entries) => {
					if (entries[0].isIntersecting) {
						fetchLetters();
					}
				},
				{ threshold: 1.0 }
			);

			if (sentinel) observer.observe(sentinel);

			return () => observer.disconnect();
		})();

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});
</script>

<svelte:head>
	<title>LetterTo - MyLetters</title>
	<meta property="og:url" content="/dashboard" />
	<meta property="og:title" content="LetterTo - MyLetters" />
	<meta name="twitter:title" content="LetterTo - MyLetters" />
</svelte:head>

{#if windowLoad}
	<div class="preloader">
		<div class="spinner"></div>
	</div>
{:else}
	<Navbar />

	{#if userRole === 'banned'}
		<section class="banned">
			<i class="ri-hand"></i>
			<h1>Account Banned</h1>
			<p>
				Several users have reported you for activity that is considered a violation of the Terms of
				Service. Your account has been temporarily suspended to ensure the safety and comfort of the
				community. If you believe this is a mistake, please contact the support.
			</p>

			<p>
				While you are banned, you will not be able to change your name or username, create a new
				letter, or edit the existing letter, you are only allowed to change your
				password.
			</p>
		</section>
	{:else}
		<section class="dash">
			<h1>Your Letters</h1>
			<p>Edit, create new letter or delete the existing letter here...</p>

			<div class="result">
				{#if letterLoad}
					<div class="spinner-wrap">
						<span class="spinner"></span>
						<p>Loading...</p>
					</div>
				{:else if globalErr}
					<div class="error">
						{globalErr}
					</div>
				{:else if cards.length < 1}
					<p class="no-result">No letter, start creating a new letter now.</p>
				{:else if cards.length > 0}
					<div class="card-list">
						{#each cards as card}
							<Letter
								letter_id={card.id}
								message={card.message}
								music_profile={card.music_profile}
								music_title={card.music_title}
								created_at={card.created_at}
								recipient_name={card.recipient_name}
								sender={card.sender}
								font={card.font}
								artis={card.artist}
								warn={card.warn}
								edit="true"
							/>
						{/each}
					</div>

					<div bind:this={sentinel} class="sentinel">
						{#if isFetching}
							<div class="spinner-wrap">
								<span class="spinner"></span>
								<p>Loading...</p>
							</div>
						{:else if cards.length >= total}
							<p class="no-result">All letters has been loaded.</p>
						{/if}
					</div>
				{/if}
			</div>
		</section>
	{/if}
	<Footer />
{/if}
