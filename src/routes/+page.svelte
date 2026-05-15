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

	onMount(async () => {
		const ft = await fetch(`/api/req?path=letter&ep=random`);
		const ftJson = (await ft.json()) as App.Platform['resp'];

		if (ftJson['status_code'] === 200 && ftJson['data']['letters']) {
			letters = ftJson['data']['letters'];
		}
	});
</script>

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
					Patrick, I don't know how to say but I love you, I always want you to come back... but you
					never did.
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
		<section class="features" id="features">
			<div class="desc">
				<h1>— FEATURES —</h1>
				<p>Everything you may need</p>
			</div>

			<div class="card-list">
				<div class="card">
					<div class="title">
						<i class="ri-lock-line" id="a"></i>
						<span>Privacy</span>
					</div>
					<p>
						Set your letter public or private. People can browse for your letter by the recipient's
						name, or make it private so that only those with the link know it.
					</p>
				</div>
				<div class="card">
					<div class="title">
						<i class="ri-timer-line" id="b"></i>
						<span>View Once</span>
					</div>
					<p>Set your letter burn once viewed or keep them indefinitely.</p>
				</div>
				<div class="card">
					<div class="title">
						<i class="ri-shield-keyhole-line" id="c"></i>
						<span>Password Protection</span>
					</div>
					<p>Add a password for added security, only those with the password can access it.</p>
				</div>
			</div>
		</section>
	</div>
</main>

<Footer />
