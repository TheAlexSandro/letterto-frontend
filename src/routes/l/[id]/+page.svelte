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
	import { isLoggedIn } from '$lib/utils/utils';
	import { showToast } from '$lib/toast';

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
		warn: string | null;
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
	let lightboxSrc = $state<string | null>(null);
	let videoEl = $state<HTMLVideoElement | null>(null);
	let isAdmin = $state(false);
	let actLoad = $state(false);
	let actionMenuOpen = $state(false);
	let imageLoaded = $state(false);
	let videoLoaded = $state(false);

	const openLightbox = (src: string) => (lightboxSrc = src);
	const closeLightbox = () => (lightboxSrc = null);

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
		const loggedIn = await isLoggedIn();
		if (loggedIn !== 'error' && loggedIn !== false && loggedIn.role) {
			isAdmin = ['admin', 'owner'].includes(loggedIn.role);
		}

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
			audio.loop = true;

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

			// audio.addEventListener('ended', () => {
			// 	audioPlayed = false;
			// 	currentTime = 0;
			// 	audio!.currentTime = 0;
			// });
		}

		if (audioPlayed) {
			audioLoad = false;
			audio.pause();
			audioPlayed = false;
		} else {
			if (videoEl && !videoEl.paused) {
				videoEl.pause();
			}

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

	const dates = (d: string) => {
		const [day, month, year] = d.split('/').map(Number);
		const months = [
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Oct',
			'Nov',
			'Dec'
		];
		const formatted = `${day} ${months[month - 1]} 20${year}`;
		return formatted;
	};

	const unlock = async (e: Event) => {
		e.preventDefault();
		passErr = '';
		buttonLoad = true;

		const ft = await fetch(`/api/req?path=letter&ep=verifyPassword`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ id: letterId, password })
		});
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

	const act = async (act: string) => {
		actLoad = true;
		actionMenuOpen = false;
		const ft = await fetch('/api/req?path=letter&ep=action', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ letter_id: letterId, action: act })
		});
		const js = (await ft.json()) as App.Platform['resp'];
		if (js['status_code'] !== 200) {
			actLoad = false;
			if (js['error_code'] === 'UNAUTHORIZED') {
				showToast('Access Denied', 'error');
				return;
			}
		} else {
			window.location.reload();
		}
	};
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'Escape') closeLightbox();
	}}
	onclick={(e) => {
		if (actionMenuOpen && !(e.target as HTMLElement).closest('.action')) {
			actionMenuOpen = false;
		}
	}}
/>

<svelte:head>
	<title>LetterTo - {!card?.recipient_name ? 'Anonymous' : card?.recipient_name}</title>
	<meta property="og:url" content="/l/{letterId}" />
	<meta
		property="og:title"
		content="LetterTo - {!card?.recipient_name ? 'Anonymous' : card?.recipient_name}"
	/>
	<meta
		name="twitter:title"
		content="LetterTo - {!card?.recipient_name ? 'Anonymous' : card?.recipient_name}"
	/>
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
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
						<img
							onclick={() => openLightbox(card!.music_profile!)}
							src={card?.music_profile}
							alt={card?.music_title}
						/>
						<div class="music-info">
							<div class="title-wrap">
								<span class="title" class:marquee={card!.music_title.length > 36}>
									{#if card!.music_title.length > 36}
										<span class="marquee-content">
											<span>{card?.music_title}</span>
											<span>{card?.music_title}</span>
										</span>
									{:else}
										{card?.music_title}
									{/if}
								</span>
							</div>
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
						<button
							disabled={audioLoad}
							type="button"
							class="music-play"
							onclick={togglePlay}
							aria-label="audio"
						>
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
							<i class="ri-quill-pen-ai-line"></i>
							<span>From: <b>{!card?.sender ? 'Anonymous' : card.sender}</b></span>
						</div>
						<div class="avatar">
							<i class="ri-user-heart-line"></i>
							<span>To: <b>{!card?.recipient_name ? 'Anonymous' : card.recipient_name}</b></span>
						</div>
					</div>
					<div class="date-chip">
						<i class="ri-calendar-line"></i>
						<span>{dates(String(card?.created_at))}</span>
					</div>
				</div>

				{#if isAdmin}
					<div class="action">
						<span>Action</span>
						<button
							aria-labelledby="menu"
							aria-expanded={actionMenuOpen}
							onclick={() => (actionMenuOpen = !actionMenuOpen)}
						>
							{#if actLoad}
								<span class="button-spinner"></span>
							{:else}
								<i class="ri-sound-module-line"></i>
							{/if}
						</button>

						{#if actionMenuOpen}
							<div class="card">
								<button class="w" disabled={card?.warn === '1'} onclick={() => act('1')}
									><i class="ri-alert-line"></i> Warn</button
								>
								<button class="b" disabled={card?.warn === '2'} onclick={() => act('2')}
									><i class="ri-spam-3-line"></i> Ban</button
								>
								{#if card?.warn}
									<button onclick={() => act('-')}
										><i class="ri-close-circle-line"></i> Remove</button
									>
								{/if}
							</div>
						{/if}
					</div>
				{/if}

				<div class="card">
					{#if card?.image || card?.video}
						<div class="media-wrap">
							{#if card?.image && card?.video}
								<div class="media-dual">
									<div class="media-item" class:loading={!imageLoaded}>
										{#if !imageLoaded}
											<div class="skeleton"></div>
										{/if}
										<!-- svelte-ignore a11y_click_events_have_key_events -->
										<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
										<img
											src={card?.image}
											aria-hidden="true"
											alt="Letter image"
											onclick={() => openLightbox(card!.image!)}
											onload={() => (imageLoaded = true)}
											class:loaded={imageLoaded}
											style="cursor:zoom-in"
										/>
									</div>
									<div class="media-item" class:loading={!videoLoaded}>
										{#if !videoLoaded}
											<div class="skeleton"></div>
										{/if}
										<video
											src={card?.video}
											controls
											bind:this={videoEl}
											onloadeddata={() => (videoLoaded = true)}
											class:loaded={videoLoaded}
											onplay={() => {
												if (audio && audioPlayed) {
													audio.pause();
													audioPlayed = false;
												}
											}}
										>
											<track kind="captions" />
										</video>
									</div>
								</div>
							{:else if card?.image}
								<div class="media-single" class:loading={!imageLoaded}>
									{#if !imageLoaded}
										<div class="skeleton"></div>
									{/if}
									<!-- svelte-ignore a11y_click_events_have_key_events -->
									<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
									<img
										src={card?.image}
										aria-hidden="true"
										alt="Letter image"
										onclick={() => openLightbox(card!.image!)}
										onload={() => (imageLoaded = true)}
										class:loaded={imageLoaded}
										style="cursor:zoom-in"
									/>
								</div>
							{:else if card?.video}
								<div class="media-single" class:loading={!videoLoaded}>
									{#if !videoLoaded}
										<div class="skeleton"></div>
									{/if}
									<video
										src={card?.video}
										controls
										bind:this={videoEl}
										onloadeddata={() => (videoLoaded = true)}
										class:loaded={videoLoaded}
										onplay={() => {
											if (audio && audioPlayed) {
												audio.pause();
												audioPlayed = false;
											}
										}}
									>
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
					<div class="desc">
						<i class="ri-lock-line" id="a"></i>
						<b>Letter Locked</b>
						<span>Please enter the password to access this letter.</span>
					</div>

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

	{#if lightboxSrc}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="lightbox-overlay"
			onclick={closeLightbox}
			role="dialog"
			aria-modal="true"
			aria-label="Image preview"
			tabindex="-1"
		>
			<button class="lightbox-close" onclick={closeLightbox} aria-label="Close">
				<i class="ri-close-line"></i>
			</button>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<img src={lightboxSrc} alt="Full size" onclick={(e) => e.stopPropagation()} />
		</div>
	{/if}
{/if}
