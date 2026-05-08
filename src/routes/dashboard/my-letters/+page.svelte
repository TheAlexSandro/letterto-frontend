<script lang="ts">
	import Navbar from '../../../components/navbar/navbar.svelte';
	import Footer from '../../../components/footer/footer.svelte';
	import './page.css';
	import { onMount } from 'svelte';
	import Letter from '../../../components/letter/letter.svelte';

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

	const fetchLetters = async () => {
		if (isFetching) return;
		if (cards.length >= total && total !== 0) return;

		isFetching = true;

		const ftLetter = await fetch(`/api/letters?path=myLetters&offset=${offset}`);
		const dataLetter = (await ftLetter.json()) as App.Platform['resp'];

		if (dataLetter['status_code'] !== 200) {
			if (dataLetter['error_code'] === 'UNAUTHORIZED') {
				window.location.href = '/auth';
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
	};

	onMount(() => {
		windowWidth = window.innerWidth;
		const handleResize = () => {
			windowWidth = window.innerWidth;
		};
		window.addEventListener('resize', handleResize);

		(async () => {
			const isLoggedIn = await fetch('/api/auth?path=accountInfo');
			const data = (await isLoggedIn.json()) as App.Platform['resp'];

			if (data['status_code'] !== 200) {
				window.location.href = '/auth';
				return;
			}

			windowLoad = false;

			// Fetch total dulu
			const ftT = await fetch('/api/letters?path=total');
			const dT = (await ftT.json()) as App.Platform['resp'];
			total = dT['data']['total'];

			// Fetch pertama
			await fetchLetters();

			// Setup IntersectionObserver setelah data pertama dimuat
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
	<meta property="og:url" content="/dashboard/my-letters" />
	<meta property="og:title" content="LetterTo - MyLetters" />
	<meta name="twitter:title" content="LetterTo - MyLetters" />
</svelte:head>

{#if windowLoad}
	<div class="preloader">
		<div class="spinner"></div>
	</div>
{:else}
	<Navbar />
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
							artis="Adele"
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
	<Footer />
{/if}
