<script lang="ts">
	import type { PageData } from './$types';
	import Navbar from '../../../components/navbar/navbar.svelte';
	import Footer from '../../../components/footer/footer.svelte';
	import { onMount } from 'svelte';
	import '../page.css';
	import { resolveFont, getFreshPreview } from '$lib/utils/utils';
	import { DotLottieSvelte } from '@lottiefiles/dotlottie-svelte';
	import Fire from '$lib/assets/Fire.lottie';
	import deezer from '$lib/assets/deezer.svg';

	type Card = {
		user_id: string;
		message: string;
		created_at: string;
		font: string;
		music_profile: string;
		music_title: string;
		artist: string;
		music: string;
		image?: string | null;
		video?: string | null;
		sender?: string | null;
		recipient_name?: string | null;
		is_burned: string;
	};

	const { data }: { data: PageData } = $props();
	const letterId = $derived(data.id);
	let windowLoad = $state(true);
	let card: Card | null = $state(null);
	let audio: HTMLAudioElement | null = $state(null);
	let audioLoad = $state(false);
	let audioPlayed = $state(false);
	let copied = $state(false);
	let currentTime = $state(0);
	let duration = $state(0);
	let showPassword = $state(false);
	let password = $state('');
	let buttonLoad = $state(false);
	let passErr = $state('');
	let isBurned = $state(false);

	const formatTime = (s: number) => {
		const m = Math.floor(s / 60);
		const sec = Math.floor(s % 60);
		return `${m}:${sec.toString().padStart(2, '0')}`;
	};

	const seekTo = (e: MouseEvent) => {
		if (!audio || !duration) return;
		const bar = e.currentTarget as HTMLElement;
		const rect = bar.getBoundingClientRect();
		const ratio = (e.clientX - rect.left) / rect.width;
		audio.currentTime = ratio * duration;
	};

	onMount(async () => {
		const ft = await fetch(`/api/letters?path=getInfo&id=${letterId}`);
		const ftJson = (await ft.json()) as App.Platform['resp'];
		if (ftJson['status_code'] !== 200) {
			if (ftJson['error_code'] === 'LETTER_LOCKED') {
				showPassword = true;
			} else if (ftJson['error_code'] === 'BURNED') {
				isBurned = true;
			} else {
				window.location.href = '/';
				return;
			}
		}
		card = ftJson['data'];

		if (!showPassword && ftJson['error_code'] !== 'BURNED') {
			await fetch(`/api/letters?path=burn&id=${letterId}`);
		}
		windowLoad = false;
	});

	const togglePlay = async () => {
		audioLoad = true;

		const previewUrl = await getFreshPreview(Number(card?.music));
		if (!previewUrl) {
			alert('Preview not available for this track.');
			audioLoad = false;
			return;
		}
		if (!audio) {
			audio = new Audio(previewUrl);

			audio.addEventListener(
				'loadedmetadata',
				() => {
					duration = audio!.duration;
				},
				{ once: true }
			);

			audio.addEventListener('timeupdate', () => {
				currentTime = audio!.currentTime;
			});

			audio.addEventListener('ended', () => {
				audioPlayed = false;
				currentTime = 0;
				audio!.currentTime = 0;
			});
		}

		if (audioPlayed) {
			audioLoad = false;
			audio.pause();
			audioPlayed = false;
		} else {
			audio
				.play()
				.then(() => {
					audioLoad = false;
					audioPlayed = true;
				})
				.catch((err) => {
					alert(err);
					audioLoad = false;
				});
		}
	};

	const copyLink = () => {
		navigator.clipboard.writeText(window.location.href).catch(() => {});
		copied = true;
		setTimeout(() => (copied = false), 1800);
	};

	const getInitial = (name?: string) => name?.charAt(0).toUpperCase() ?? '?';

	const unlock = async (e: Event) => {
		e.preventDefault();
		passErr = '';
		buttonLoad = true;

		const ft = await fetch(`/api/letters?path=verifyPassword&id=${letterId}&password=${password}`);
		const js = (await ft.json()) as App.Platform['resp'];

		if (js['status_code'] !== 200) {
			passErr =
				js['error_code'] === 'INVALID_PASSWORD'
					? 'Wrong password.'
					: js['error_code'] === 'BAD_REQUEST'
						? 'Something went wrong...'
						: js['error_code'] === 'LETTER_NOT_FOUND'
							? `It's appear that the letter has been deleted.`
							: '';
			buttonLoad = false;
		} else {
			window.location.reload();
		}
	};
</script>

<svelte:head>
	<title>LetterTo - Letter {letterId}</title>
	<meta property="og:url" content="/l/{letterId}" />
	<meta property="og:title" content="LetterTo - Letter {letterId}" />
	<meta name="twitter:title" content="LetterTo - Letter {letterId}" />
</svelte:head>

{#if windowLoad}
	<div class="preloader">
		<div class="spinner"></div>
	</div>
{:else}
	<Navbar />

	<section class="letter">
		<div class="letter-wrap">
			{#if isBurned}
				<div class="burned">
					<div class="fire">
						<DotLottieSvelte src={Fire} loop autoplay />
					</div>
					<h1>Burned!</h1>
					<p>
						This letter has been burned, you can ask the sender to restore it so you can view once
						again.
					</p>
				</div>
			{:else if !showPassword}
				<div class="music-pill">
					<div class="music-left">
						<img src={card?.music_profile} alt={card?.music_title} />
						<div class="music-info">
							<span class="title"
								>{card!.music_title.length >= 36
									? card?.music_title.substring(0, 36) + "..."
									: card?.music_title}</span
							>
							<span class="artist">{card?.artist}</span>
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div class="progress">
								<div class="progress-bar" onclick={seekTo}>
									<div
										class="progress-fill"
										style="width: {duration ? (currentTime / duration) * 100 : 0}%"
									></div>
								</div>
								<div class="progress-times">
									<span>{formatTime(currentTime)}</span>
									<span>{formatTime(duration)}</span>
								</div>
							</div>
						</div>
					</div>
					<div class="right">
						<img src={deezer} alt="deezer" />
						<button type="button" class="music-play" onclick={togglePlay} aria-label="audio">
							{#if audioLoad}
								<div class="spinner"></div>
							{:else if audioPlayed}
								<i class="ri-pause-fill"></i>
							{:else}
								<i class="ri-play-fill"></i>
							{/if}
						</button>
					</div>
				</div>

				<div class="meta-row">
					<div class="from-to-inline">
						<div class="avatar">
							{getInitial(!card?.sender ? 'Anonymous' : card?.sender)}
						</div>
						<span class="name-text">{!card?.sender ? 'Anonymous' : card?.sender}</span>
						<i class="ri-arrow-right-line arrow-icon"></i>
						<div class="avatar avatar-to">
							{getInitial(!card?.recipient_name ? 'Anonymous' : card?.recipient_name)}
						</div>
						<span class="name-text"
							>{!card?.recipient_name ? 'Anonymous' : card?.recipient_name}</span
						>
					</div>
					<div class="date-chip">
						<i class="ri-calendar-line"></i>
						{card?.created_at}
					</div>
				</div>

				<div class="card">
					{#if card?.image || card?.video}
						<div class="media-wrap">
							{#if card?.image && card?.video}
								<div class="media-dual">
									<div class="media-item">
										<img src={card?.image} aria-hidden="true" alt="Letter image" />
									</div>
									<div class="media-item">
										<video src={card?.video} controls>
											<track kind="captions" />
										</video>
									</div>
								</div>
							{:else if card?.image}
								<div class="media-single">
									<img src={card?.image} aria-hidden="true" alt="Letter image" />
								</div>
							{:else if card?.video}
								<div class="media-single">
									<video src={card?.video} controls>
										<track kind="captions" />
									</video>
								</div>
							{/if}
						</div>
					{/if}

					<div class="body">
						<div class="ql-editor">
							<p class="message" style="font-family: {resolveFont(String(card?.font))};">
								{@html card?.message}
							</p>
						</div>
					</div>

					<div class="card-footer">
						<div class="footer-left">
							<i class="ri-heart-fill"></i>
							Made with Love
						</div>
						<div class="footer-right">
							<button class="copy-btn" onclick={copyLink}>
								<i class={copied ? 'ri-check-line' : 'ri-link'}></i>
								Copy
							</button>
						</div>
					</div>
				</div>
			{:else}
				<div class="pwd">
					<h1>Upss...!</h1>
					<p>This letter is password protected, please enter the password to proceed.</p>

					<form method="post" onsubmit={unlock}>
						<input
							type="password"
							name="password"
							id="password"
							placeholder="••••••••"
							required
							bind:value={password}
							disabled={buttonLoad}
						/>
						{#if passErr}
							<span>{passErr}</span>
						{/if}

						<div class="btns">
							<button disabled={buttonLoad}>
								{#if buttonLoad}
									<span class="button-spinner"></span>
								{:else}<i class="ri-lock-unlock-line"></i> Unlock
								{/if}</button
							>
						</div>
					</form>
				</div>
			{/if}
		</div>
	</section>

	<Footer />
{/if}
