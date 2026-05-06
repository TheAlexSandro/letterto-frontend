<script lang="ts">
	import Navbar from '../components/navbar/navbar.svelte';
	import Footer from '../components/footer/footer.svelte';
	import './page.css';
	import { onMount } from 'svelte';
	import { resolveFont } from '$lib/utils/utils';

	type Card = {
		letter_id: string;
		message: string;
		music_profile: string;
		music_title: string;
		created_at: string;
		recipient_name: string;
		sender: string;
		font: string;
		is_locked: boolean;
	};

	let cards: Card[] = $state([]);

	let showClearButton = $state(false);
	let searchQuery = $state('');
	let windowWidth = $state(0);
	let buttonLoad = $state(false);

	onMount(() => {
		windowWidth = window.innerWidth;
		const handleResize = () => {
			windowWidth = window.innerWidth;
		};
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});

	const onInput = () => {
		showClearButton = searchQuery.length > 0;
	};

	const clearInput = () => {
		searchQuery = '';
		showClearButton = false;
	};

	const handleSubmit = async () => {
		buttonLoad = true;
		const ft = await fetch(`/api/letters?path=search&recipient_name=${searchQuery}`);
		const js = (await ft.json()) as App.Platform['resp'];

		cards = js['data'] ?? [];
		buttonLoad = false;
	};
</script>

<Navbar />

<main>
	<section class="head">
		<div class="desc">
			<h1>LetterTo</h1>
			<p>
				Sometimes the truest words are the ones we're afraid to say. LetterTo lets you send them
				anyway — no name, no fear, just honesty
			</p>
		</div>
	</section>

	<section class="box">
		<section class="browse">
			<div class="form">
				<div class="search-box">
					<i class="ri-user-3-line user-icon"></i>
					<input
						disabled={buttonLoad}
						type="text"
						placeholder="Recipient's name..."
						id="search"
						name="search"
						bind:value={searchQuery}
						oninput={onInput}
					/>
					<div class="btn">
						{#if showClearButton}
							<button disabled={buttonLoad} aria-label="Clear search" id="g" onclick={clearInput}>
								<i class="ri-close-line"></i>
							</button>
						{/if}
						<button disabled={buttonLoad} onclick={handleSubmit} aria-labelledby="search" id="f"
							><i class="ri-search-2-line"></i></button
						>
					</div>
				</div>
			</div>

			<div class="result">
				<h1>Letters</h1>
				{#if buttonLoad}
					<div class="spinner-wrap">
						<span class="spinner"></span>
						<p>Searching...</p>
					</div>
				{:else if cards.length === 0}
					<p class="no-result">No result found.</p>
				{:else}
					{#each cards as card}
						<div class="card">
							<div class="profile">
								<div class="left">
									<img src={card.music_profile} alt="music profile" />
									<div class="info">
										<span>From: {card.sender}</span>
										<span id="t"
											>To: {card.recipient_name.length > 7
												? `${card.recipient_name.substring(0, 7)}...`
												: card.recipient_name}</span
										>
									</div>
								</div>
								{#if card.is_locked}
									<div class="right">
										<i class="ri-lock-line"></i><span>Locked</span>
									</div>
								{/if}
							</div>
							<div
								class="content"
								style={!card.is_locked ? `font-family: '${resolveFont(card.font)}', cursive;` : ''}
							>
								<a href={`/l/${card.letter_id}`}>
									{#if !card.is_locked}
										<p>{card.message}</p>
									{:else}
										<div class="lock">
											<i class="ri-lock-line"></i>
											<span>Content Locked</span>
										</div>
									{/if}
								</a>
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
				{/if}
			</div>
		</section>

		<section id="features" class="features">
			<h1>Features</h1>
			<div class="list">
				<div class="item">
					<i class="ri-lock-line"></i>
					<div class="text">
						<span>Public or Private Letter</span>
						<p>
							Send letters that are visible to everyone or keep them private belongs to someone.
						</p>
					</div>
				</div>
				<div class="item">
					<i class="ri-timer-line"></i>
					<div class="text">
						<span>Burn once viewed</span>
						<p>Set your letter burn once viewed or keep them indefinitely.</p>
					</div>
				</div>
				<div class="item">
					<i class="ri-key-line"></i>
					<div class="text">
						<span>Password protected</span>
						<p>Secure your letters with a password for additional privacy.</p>
					</div>
				</div>
			</div>
			<div class="more">
				<p>And many more...!</p>
				<button>Try Now</button>
			</div>
		</section>
	</section>
</main>

<Footer />
