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
	import { isLoggedIn, sanitize } from '$lib/utils/utils';
	import { showToast } from '$lib/toast';
	import { fade } from 'svelte/transition';
	import { beforeNavigate } from '$app/navigation';

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
		warn: string;
		audio_autoplay: boolean;
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
	let showSlowWarning = $state(false);
	let slowTimer: ReturnType<typeof setTimeout> | null = null;
	let infoPopupOpen = $state(false);
	let letterNotFound = $state(false);
	let letterOpened = $state(false);
	let opening = $state(false);
	let hideAutoplayWarning = $state(false);

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

	const openLetter = async () => {
		if (opening || letterOpened) return;
		opening = true;
		let time = card?.audio_autoplay ? 1300 : 1000;

		setTimeout(() => {
			const revealLetter = () => {
				letterOpened = true;

				if (card?.image || card?.video) {
					slowTimer = setTimeout(() => {
						if (!imageLoaded || !videoLoaded) {
							showSlowWarning = true;
						}
					}, 5000);
				}
			};

			if (card?.audio_autoplay) {
				const signal = { cancelled: false };
				let settled = false;
				const audioTimeout = setTimeout(() => {
					if (settled) return;
					settled = true;
					signal.cancelled = true;
					audioLoad = false;
					revealLetter();
				}, 10000);

				togglePlay(signal).finally(() => {
					if (settled) return;
					settled = true;
					clearTimeout(audioTimeout);
					revealLetter();
				});
			} else {
				revealLetter();
			}
		}, time);
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
			} else if (ftJson['error_code'] === 'LETTER_NOT_FOUND') {
				letterNotFound = true;
			} else {
				window.location.href = '/';
				return;
			}
		}
		card = ftJson['data'];
		windowLoad = false;
	});

	beforeNavigate(() => {
		if (audio) {
			audio.pause();
			audioPlayed = false;
			currentTime = 0;
			audio!.currentTime = 0;
		}
		if (videoEl) {
			videoEl.pause();
			videoEl.currentTime = 0;
		}
	});

	const togglePlay = async (signal?: { cancelled: boolean }) => {
		audioLoad = true;

		const previewUrl = await getFreshPreview(Number(card?.music));
		if (signal?.cancelled) {
			audioLoad = false;
			return;
		}

		if (!previewUrl) {
			showToast('Preview not available for this track.', 'error', 5000);
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
			return;
		}

		if (videoEl && !videoEl.paused) {
			videoEl.pause();
		}

		if (signal?.cancelled) {
			audioLoad = false;
			return;
		}

		try {
			await audio.play();

			if (signal?.cancelled) {
				audio.pause();
				audioPlayed = false;
				audioLoad = false;
				return;
			}

			audioLoad = false;
			audioPlayed = true;
		} catch (err) {
			console.log(err);
			showToast('Cannot play audio', 'error', 5000);
			audioLoad = false;
		}
	};

	const openLightbox = (src: string, ready: boolean = true) => {
		if (!ready) return;
		lightboxSrc = src;
	};
	const closeLightbox = () => (lightboxSrc = null);

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
		if (e.key === 'Escape') {
			closeLightbox();
			infoPopupOpen = false;
		}
	}}
	onclick={(e) => {
		if (actionMenuOpen && !(e.target as HTMLElement).closest('.action')) {
			actionMenuOpen = false;
		}
		if (infoPopupOpen && !(e.target as HTMLElement).closest('.media-info')) {
			infoPopupOpen = false;
		}
	}}
/>

<svelte:head>
	<title
		>{!letterNotFound
			? !card?.recipient_name
				? 'LetterTo - Anonymous'
				: `LetterTo - ${card?.recipient_name}`
			: 'Letter Not Found'}</title
	>
	<meta property="og:url" content="/l/{letterId}" />
	<meta
		property="og:title"
		content={!letterNotFound
			? !card?.recipient_name
				? 'LetterTo - Anonymous'
				: `LetterTo - ${card?.recipient_name}`
			: 'Letter Not Found'}
	/>
	<meta
		name="twitter:title"
		content={!letterNotFound
			? !card?.recipient_name
				? 'LetterTo - Anonymous'
				: `LetterTo - ${card?.recipient_name}`
			: 'Letter Not Found'}
	/>
</svelte:head>

{#if windowLoad}
	<div class="preloader">
		<div class="spinner"></div>
	</div>
{:else}
	<Navbar />

	<section class="letter">
		{#if !letterNotFound}
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
					{#if !letterOpened}
						<div class="envelope-gate" class:opening>
							<div class="envelope-gate-scene">
								<svg class="gate-envelope" viewBox="0 0 320 250" aria-hidden="true">
									<rect class="g-body" x="10" y="40" width="300" height="160" rx="14" />

									<g transform="translate(0, 10)">
										<g class="g-paper-group">
											<rect class="g-paper" x="38" y="-6" width="244" height="172" rx="8" />
											<rect class="g-skel g-skel-1" x="60" y="20" width="110" height="9" rx="4.5" />
											<rect class="g-skel g-skel-2" x="60" y="42" width="200" height="9" rx="4.5" />
											<rect class="g-skel g-skel-3" x="60" y="64" width="170" height="9" rx="4.5" />
											<rect class="g-skel g-skel-4" x="60" y="86" width="190" height="9" rx="4.5" />
											<rect
												class="g-skel g-skel-5"
												x="60"
												y="108"
												width="130"
												height="9"
												rx="4.5"
											/>
										</g>
									</g>

									<path class="g-flap" d="M10,42 L160,142 L310,42 Z" />
									<circle class="g-seal" cx="160" cy="92" r="20" />
									<text class="g-seal-letter" x="160" y="99" text-anchor="middle">L</text>
								</svg>
							</div>

							<p class="gate-title">
								A letter for <em
									>{!card?.recipient_name ? 'anonymous' : card?.recipient_name.toLowerCase()}</em
								>
							</p>
							<p class="gate-desc">Click the button below to open the letter.</p>

							{#if card?.audio_autoplay && !hideAutoplayWarning}
								<div class="warning">
									<div class="wrap">
										<i class="ri-information-line"></i>
										This letter has music autoplay enabled, please check your device volume condition
										first.
									</div>
									<button
										aria-labelledby="close"
										onclick={() => {
											hideAutoplayWarning = !hideAutoplayWarning;
										}}><i class="ri-close-circle-line"></i></button
									>
								</div>
							{/if}

							<button class="gate-open-btn" onclick={openLetter} disabled={opening}>
								<i class="ri-mail-open-line"></i>
								Open
							</button>
						</div>
					{:else}
						<div transition:fade={{ duration: 350 }}>
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
											<span class="title" class:marquee={card!.music_title.length > 20}>
												{#if card!.music_title.length > 20}
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
										onclick={() => togglePlay()}
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
										<span
											>To: <b>{!card?.recipient_name ? 'Anonymous' : card.recipient_name}</b></span
										>
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
														src={letterOpened ? card?.image : undefined}
														aria-hidden="true"
														alt="Letter image"
														onclick={() => openLightbox(card!.image!, imageLoaded)}
														onload={() => {
															imageLoaded = true;
															if (imageLoaded && (videoLoaded || !card?.video)) {
																showSlowWarning = false;
																if (slowTimer) clearTimeout(slowTimer);
															}
														}}
														class:loaded={imageLoaded}
														style="cursor:zoom-in"
													/>
												</div>
												<div class="media-item" class:loading={!videoLoaded}>
													{#if !videoLoaded}
														<div class="skeleton"></div>
													{/if}
													<video
														src={letterOpened ? card?.video : undefined}
														preload="metadata"
														controls
														bind:this={videoEl}
														onloadeddata={() => {
															videoLoaded = true;
															if (videoLoaded && (imageLoaded || !card?.image)) {
																showSlowWarning = false;
																if (slowTimer) clearTimeout(slowTimer);
															}
														}}
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
													src={letterOpened ? card?.image : undefined}
													aria-hidden="true"
													alt="Letter image"
													onclick={() => openLightbox(card!.image!, imageLoaded)}
													onload={() => {
														imageLoaded = true;
														if (imageLoaded && (videoLoaded || !card?.video)) {
															showSlowWarning = false;
															if (slowTimer) clearTimeout(slowTimer);
														}
													}}
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
													src={letterOpened ? card?.video : undefined}
													preload="metadata"
													controls
													bind:this={videoEl}
													onloadeddata={() => {
														videoLoaded = true;
														if (videoLoaded && (imageLoaded || !card?.image)) {
															showSlowWarning = false;
															if (slowTimer) clearTimeout(slowTimer);
														}
													}}
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
									{#if showSlowWarning && (!imageLoaded || !videoLoaded)}
										<div class="media-info">
											<i class="ri-alert-line"></i> Taking longer than usual...
											<button
												aria-label="More info"
												aria-expanded={infoPopupOpen}
												onclick={() => (infoPopupOpen = !infoPopupOpen)}
											>
												<i class="ri-question-line"></i>
											</button>

											{#if infoPopupOpen}
												<div class="info-popup">
													<p>
														Loading times can be caused by many factors, with the main one usually
														being your internet connection.
													</p>
													<p>
														If you're using a proxy or VPN and the loading is taking a long time to
														finish, consider turning it off.
													</p>
													<p>
														Otherwise, please wait a little longer — the image or video size may be
														large and take more time to load.
													</p>
													<p>If you notice something is wrong, please contact support.</p>
												</div>
											{/if}
										</div>
									{/if}
								{/if}

								<div class="body">
									<div class="ql-editor">
										<p class="message" style="font-family: {resolveFont(String(card?.font))};">
											{@html sanitize(String(card?.message))}
										</p>
									</div>
								</div>
							</div>
						</div>
					{/if}
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
		{:else}
			<div class="notfound-wrap">
				<div class="scene">
					<svg class="flightpath" viewBox="0 0 400 200" aria-hidden="true">
						<path d="M20,170 Q120,40 200,90 T380,30" />
					</svg>

					<div class="envelope-wrap">
						<svg class="envelope" viewBox="0 0 320 220" aria-hidden="true">
							<rect class="body" x="10" y="40" width="300" height="160" rx="14" />
							<path class="flap" d="M10,42 L160,142 L310,42 Z" />
							<rect class="line line-1" x="120" y="148" width="130" height="7" rx="3.5" />
							<rect class="line line-2" x="120" y="166" width="85" height="7" rx="3.5" />
							<circle class="seal" cx="160" cy="118" r="20" />
							<text class="seal-letter" x="160" y="125" text-anchor="middle">L</text>
						</svg>

						<div class="postmark">
							<span class="postmark-eyebrow">Post Office</span>
							<span class="postmark-code">404</span>
							<span class="postmark-foot">Not Found</span>
						</div>
					</div>
				</div>

				<p class="eyebrow">404</p>
				<h1 class="title">Letter Not Found</h1>
				<p class="desc">
					Please check the letter ID, you may entered incorrectly or the letter just does not exist.
				</p>

				<a href="/" class="cta">
					<i class="ri-arrow-left-line"></i>
					Return
				</a>
			</div>
		{/if}
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
