<script lang="ts">
	import Navbar from '../components/navbar/navbar.svelte';
	import Footer from '../components/footer/footer.svelte';
	import './page.css';
	import { resolveFont } from '$lib/utils/utils';
	import deezer from '$lib/assets/deezer2.svg';
	import { onMount } from 'svelte';
	import Letter from '../components/letter/letter.svelte';

	type Letter = {
		letter_id: string;
		music_profile: string;
		music_title: string;
		created_at: string;
		recipient_name: string;
		sender: string;
		message: string;
		font: string;
		is_locked: boolean;
		artist: string;
	};

	let letters: Letter[] = $state([]);
	let windowLoad = $state(true);

	onMount(async () => {
		const ft = await fetch(`/api/req?path=letter&ep=random`);
		const ftJson = (await ft.json()) as App.Platform['resp'];

		if (ftJson['status_code'] === 200 && ftJson['data']['letters']) {
			letters = ftJson['data']['letters'];
		}

		windowLoad = false;
	});
</script>

{#if windowLoad}
	<div class="preloader">
		<div class="spinner"></div>
	</div>
{:else}
	<Navbar />

	<main>
		<section class="header">
			<div class="left">
				<div class="tag"><i class="ri-sparkling-line"></i> Simple and meaningful</div>
				<h1>Send a letter to <em>your</em> beloved</h1>
				<p>
					Sometimes the truest words are the ones we're afraid to say. LetterTo lets you send them
					anyway — no fear, just honesty.
				</p>

				<div class="btn">
					<button
						class="fill"
						onclick={() => {
							window.location.href = '/find';
						}}><i class="ri-search-2-line"></i> Find a letter</button
					>
					<button
						class="out"
						onclick={() => {
							window.location.href = '/new';
						}}><i class="ri-mail-line"></i> Create new letter</button
					>
				</div>
			</div>

			<div class="lla">
				<div class="top">
					<div class="info">
						<i class="ri-mail-line"></i>
						<div class="c">
							<span><strong>From:</strong><em>someone</em></span>
							<span><strong>To:</strong><em>patrick</em></span>
						</div>
					</div>
					<div class="date">
						<i class="ri-calendar-todo-line"></i>
						<span>07/05/26</span>
					</div>
				</div>

				<div class="content">
					<p style="font-family: {resolveFont('ind-fl')};">
						Patrick, I don't know how to say but I love you, I always want you to come back... but
						you never did.
					</p>
				</div>

				<div class="footer">
					<div class="music">
						<img
							src="https://cdn-images.dzcdn.net/images/cover/eaeadce7932a97533fe495881d2fcd7a/500x500-000000-80-0-0.jpg"
							alt="Music Profile"
						/>
						<div class="desc">
							<span class="title">Hello</span>
							<span class="artist">Adele</span>
							<span class="song"><i class="ri-bar-chart-horizontal-line"></i> Deezer</span>
						</div>
					</div>
					<div class="deezer-side">
						<img src={deezer} alt="Deezer Logo" />
					</div>
				</div>
			</div>
		</section>

		{#if letters.length >= 10}
			<div class="list">
				<div class="track">
					{#each letters as letter}
						<Letter
							letter_id={letter.letter_id}
							message={letter.message}
							music_profile={letter.music_profile}
							music_title={letter.music_title}
							created_at={letter.created_at}
							recipient_name={letter.recipient_name}
							sender={letter.sender}
							font={letter.font}
							is_locked={letter.is_locked}
							artis={letter.artist}
							hide_sender={true}
						/>
					{/each}

					{#each letters as letter}
						<Letter
							letter_id={letter.letter_id}
							message={letter.message}
							music_profile={letter.music_profile}
							music_title={letter.music_title}
							created_at={letter.created_at}
							recipient_name={letter.recipient_name}
							sender={letter.sender}
							font={letter.font}
							is_locked={letter.is_locked}
							artis={letter.artist}
							hide_sender={true}
						/>
					{/each}
				</div>
			</div>
		{/if}

		<div class="any">
			<section class="features">
				<p class="feat-label">FEATURES</p>
				<h2>Everything you may need</h2>
				<p class="feat-subtitle">
					Powerful features to help you share letters securely and on your own terms.
				</p>

				<div class="feat-grid">
					<div class="feat-card purple">
						<div class="card-top">
							<div class="card-icon"><i class="ri-lock-star-line"></i></div>
							<span class="card-num">01</span>
						</div>
						<p class="card-name">Privacy</p>
						<hr class="card-divider" />
						<p class="card-desc">
							Set your letter public or private. People can browse for your letter by the
							recipient's name, or make it private so that only those with the link know it.
						</p>
					</div>

					<div class="feat-card green">
						<div class="card-top">
							<div class="card-icon"><i class="ri-timer-line"></i></div>
							<span class="card-num">02</span>
						</div>
						<p class="card-name">View Once</p>
						<hr class="card-divider" />
						<p class="card-desc">Set your letter to burn once viewed or keep them indefinitely.</p>
					</div>

					<div class="feat-card amber">
						<div class="card-top">
							<div class="card-icon"><i class="ri-shield-check-line"></i></div>
							<span class="card-num">03</span>
						</div>
						<p class="card-name">Password Protection</p>
						<hr class="card-divider" />
						<p class="card-desc">
							Add a password for added security, only those with the password can access it.
						</p>
					</div>
				</div>

				<div class="feat-more">
					<div class="f">
						<span><i class="ri-bard-line"></i> And more, try it now!</span>
						<div class="down">
							<i class="ri-arrow-down-line"></i>
						</div>
						<button
							class="fill"
							onclick={() => {
								window.location.href = '/new';
							}}><i class="ri-mail-line"></i> Create new letter</button
						>
					</div>
				</div>
			</section>
		</div>
	</main>

	<Footer />
{/if}
