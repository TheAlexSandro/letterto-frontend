<script lang="ts">
	import Navbar from '../../../components/navbar/navbar.svelte';
	import Footer from '../../../components/footer/footer.svelte';
	import './page.css';
	import { onMount } from 'svelte';
	import { resolveFont } from '$lib/utils/utils';

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
	let copied = $state(false);
	let buttonLoad = $state(false);

	onMount(() => {
		windowWidth = window.innerWidth;
		const handleResize = () => {
			windowWidth = window.innerWidth;
		};
		window.addEventListener('resize', handleResize);

		(async () => {
			const isLoggedIn = await fetch('/api/auth?path=accountInfo');
			const data = await isLoggedIn.json();

			if (data['status_code'] !== 200) {
				window.location.href = '/auth';
				return;
			}

			windowLoad = false;

			const ftLetter = await fetch('/api/letters?path=myLetters');
			const dataLetter = await ftLetter.json();

			if (dataLetter['status_code'] !== 200) {
				if (dataLetter['error_code'] === 'UNAUTHORIZED') {
					window.location.href = '/auth';
					return;
				}
				globalErr = dataLetter['BAD_REQUEST']
					? `Something went wrong, please reload this page.`
					: ``;
				letterLoad = false;
			} else {
				cards = dataLetter['data'];
				letterLoad = false;
			}
		})();

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});

	const copyLink = (letterId: string) => {
		const url = `${window.location.hostname}/letter/${letterId}`;
		navigator.clipboard.writeText(url).catch(() => {});
		copied = true;
		setTimeout(() => (copied = false), 1800);
	};

	const editOpen = (letterId: string) => {
		window.location.href = `/letter/edit/${letterId}`;
	};

	const delLetter = async (letterId: string) => {
		const c = window.confirm(
			'Are you sure you want to delete this letter? The message, the image/video in this letter will also be deleted.'
		);
		if (c) {
			letterLoad = true;
			const ft = await fetch(`/api/letters?path=remove&id=${letterId}`);
			const jsons = await ft.json();

			if (jsons['status_code'] !== 200) {
				if (jsons['error_code'] === 'UNAUTHORIZED') {
					window.location.href = '/auth';
					return;
				}
			}

			window.location.reload();
		}
	};
</script>

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
						<div class="card">
							<div class="profile">
								<div class="left">
									<img src={card.music_profile} alt="music profile" />
									<div class="info">
										<span>From: {card.sender}</span>
										<span id="t">To: {card.recipient_name}</span>
									</div>
								</div>
								<div class="btn">
									<button
										id="trans"
										aria-labelledby="copy"
										onclick={() => copyLink(card.id)}
										disabled={copied || buttonLoad}
									>
										{#if !copied}
											<i class="ri-file-copy-line"></i>
										{:else}
											<i class="ri-check-line"></i>
										{/if}
									</button>
									<button
										disabled={buttonLoad}
										id="blue"
										aria-labelledby="edit"
										onclick={() => editOpen(card.id)}><i class="ri-pencil-line"></i></button
									>
									<button
										disabled={buttonLoad}
										id="red"
										aria-labelledby="remove"
										onclick={() => delLetter(card.id)}><i class="ri-delete-bin-line"></i></button
									>
								</div>
							</div>
							<div class="content" style="font-family: '{resolveFont(card.font)}', cursive;">
								<a href={`/letter/${card.id}`}><p>{card.message}</p></a>
							</div>
							<div class="bottom">
								<div class="date">{card.created_at}</div>
								<span
									><i class="ri-disc-line"></i>
									{windowWidth <= 400
										? `${card.music_title.substring(0, 12)}...`
										: card.music_title.length > 30
											? card.music_title.substring(0, 30)
											: card.music_title}
								</span>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</section>
	<Footer />
{/if}
