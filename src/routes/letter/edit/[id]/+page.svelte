<script lang="ts">
	import type { PageData } from './$types';
	import Navbar from '../../../../components/navbar/navbar.svelte';
	import Footer from '../../../../components/footer/footer.svelte';
	import '../../../new/page.css';
	import { onMount } from 'svelte';
	import { resolveFont } from '$lib/utils/utils';
	import { tick } from 'svelte';

	type Track = {
		id: number;
		title: string;
		artist: { name: string };
		preview: string;
		album: { cover_medium: string };
	};

	type Checkbox = 'viewOnce' | 'pass' | 'showPass' | 'adv' | 'showSend' | 'showRecp';

	const { data }: { data: PageData } = $props();
	const ids = $derived(data.id);

	let windowLoad = $state(true);
	let query = $state('');
	let results: Track[] = $state([]);
	let selected: Track | null = $state(null);
	let loading = $state(false);
	let audio: HTMLAudioElement | null = $state(null);
	let debounce: ReturnType<typeof setTimeout>;
	let currentPlayingId: number | null = $state(null);
	let duration: string = $state('');
	let adv: boolean = $state(false);
	let privacy = $state('public');
	let viewOnce: boolean = $state(false);
	let usePassword: boolean = $state(false);
	let showPassword: boolean = $state(false);
	let password = $state('');
	let font: string = $state('playwrite-nz');
	let letterId = $state('');
	let imageFile: File | null = $state(null);
	let videoFile: File | null = $state(null);
	let imagePreview: string | null = $state(null);
	let videoPreview: string | null = $state(null);
	let showSender = $state(true);
	let showRecipient = $state(true);
	let musicLoad = $state(0);
	let recipientName = $state('');
	let letterMessage = $state('');
	let globalErr = $state('');

	let musicError = $state(false);
	let fileError = $state('');
	let passError = $state('');
	let idError = $state('');

	let editSuccess = $state(false);
	let buttonLoad = $state(false);
	let dropdownClosed = $state(false);
	let uploadRef: HTMLElement | null = $state(null);
	let copied = $state(false);

	async function scrollToError() {
		await tick();

		const el = document.querySelector('.error-input');
		el?.scrollIntoView({
			behavior: 'smooth',
			block: 'center'
		});
	}

	const generateID = (length: number) => {
		const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		const panjangKarakter = characters.length;
		let result = '';

		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * panjangKarakter));
		}

		return result;
	};

	onMount(async () => {
		const isLoggedIn = await fetch('/api/auth?path=accountInfo');
		const data = await isLoggedIn.json();

		if (data['status_code'] !== 200) {
			window.location.href = '/auth';
			return;
		}

		const ft = await fetch(`/api/letters?path=getInfo&id=${ids}&edit=yes`);
		const ftJson = await ft.json();
		if (ftJson['status_code'] !== 200) {
			window.location.href = '/dashboard/my-letters';
			return;
		}

		const letData = ftJson['data'];
		recipientName = letData['recipient_name'];
		letterMessage = letData['message'];
		selected = {
			id: 1,
			title: letData['music_title'],
			artist: { name: letData['artist'] },
			preview: letData['music'],
			album: { cover_medium: letData['music_profile'] }
		};
        query = `${selected.title} — ${selected.artist.name}`;
		if (letData['image'] !== '-') {
			imagePreview = letData['image'];
		}
		if (letData['video'] !== '-') {
			videoPreview = letData['video'];
		}
		privacy = letData['privacy'];
		viewOnce = letData['view-once'] === 'yes' ? true : false;
		if (letData['password'] !== '-') {
			usePassword = true;
			password = letData['password'];
		}
		font = letData['font'];
		letterId = letData['id'];
		showSender = letData['show_sender'] === 'yes' ? true : false;
		showRecipient = letData['show_recipient'] === 'yes' ? true : false;

		windowLoad = false;
	});

	const search = () => {
		if (!query.trim()) {
			audio?.pause();
			results = [];
			return;
		}
		loading = true;
		clearTimeout(debounce);
		debounce = setTimeout(async () => {
			const res = await fetch(`/api/music?q=${encodeURIComponent(query)}`);
			const data = await res.json();
			results = data.data ?? [];
			loading = false;
		}, 400);
	};

	const formatWaktu = (s: number) => {
		const totalDetikBulat = Math.floor(s);
		const menit = Math.floor(totalDetikBulat / 60);
		const detik = totalDetikBulat % 60;
		const menitFormat = String(menit).padStart(2, '0');
		const detikFormat = String(detik).padStart(2, '0');

		return `${menitFormat}:${detikFormat}`;
	};

	const select = (track: Track) => {
		musicError = false;
		selected = track;
		query = `${track.title} — ${track.artist.name}`;
		results = [];
	};

	const togglePlay = (track: Track) => {
		if (currentPlayingId === track.id) {
			audio?.pause();
			audio = null;
			currentPlayingId = null;
			return;
		}
		musicLoad = track.id;

		audio?.pause();
		const aud = new Audio(track.preview);
		aud.addEventListener(
			'loadedmetadata',
			() => {
				aud!.play();
				musicLoad = 0;
				audio = aud;
				currentPlayingId = track.id;
			},
			{ once: true }
		);

		aud.addEventListener('timeupdate', () => {
			duration = formatWaktu(aud.duration - aud.currentTime);
		});

		aud.addEventListener('ended', () => {
			currentPlayingId = null;
			audio = null;
		});
	};

	const clearSelected = () => {
		audio?.pause();
		audio = null;
		currentPlayingId = null;
		selected = null;
		query = '';
	};

	const handleFile = (e: Event, type: 'image' | 'video') => {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const url = URL.createObjectURL(file);

		if (type === 'image') {
			imageFile = file;
			imagePreview = url;
		} else {
			videoFile = file;
			videoPreview = url;
		}
	};

	const clearFile = (type: 'image' | 'video') => {
		if (type === 'image') {
			imageFile = null;
			imagePreview = null;
		} else {
			videoFile = null;
			videoPreview = null;
		}
	};

	const handlePrivacy = () => {
		privacy = privacy === 'public' ? 'private' : 'public';
	};

	const randomId = () => {
		letterId = generateID(8);
	};

	const handleCheckbox = (type: Checkbox) => {
		if (type === 'adv') {
			adv = !adv;
		}
		if (type === 'viewOnce') {
			viewOnce = !viewOnce;
		}
		if (type === 'pass') {
			usePassword = !usePassword;
			showPassword = false;
			password = '';
		}
		if (type === 'showPass') {
			showPassword = !showPassword;
		}
		if (type === 'showSend') {
			showSender = !showSender;
		}
		if (type === 'showRecp') {
			showRecipient = !showRecipient;
		}
	};

	const handleInputPass = () => {
		if (password.length > 8) {
			passError = 'Max password length is 8 characters.';
		} else {
			passError = '';
		}
	};

	const handleInputId = () => {
		if (letterId.length > 20) {
			idError = 'Max reference id length is 20 characters.';
		} else {
			idError = '';
		}
	};

	const copyLink = () => {
		const url = `${window.location.hostname}/letter/${letterId}`;
		navigator.clipboard.writeText(url).catch(() => {});
		copied = true;
		setTimeout(() => (copied = false), 1800);
	};

	const handeSubmit = async (e: Event) => {
		e.preventDefault();
		buttonLoad = true;
		dropdownClosed = true;
		adv = false;
        audio?.pause();
		uploadRef!.style.opacity = '0.8 !important';
		if (
			!selected ||
			(usePassword && !password) ||
			(usePassword && password && password.length > 8) ||
			!letterId
		) {
			if (!selected) {
				musicError = true;
			}
			if (usePassword && !password) {
				passError = 'Password is required when enabled.';
			}
			if (usePassword && password && password.length > 8) {
				passError = 'Max password length is 8 characters.';
			}
			if (!letterId) {
				idError = 'Reference ID cannot be empty.';
			}
			if (letterId && letterId.length > 20) {
				idError = 'Max reference id length is 20 characters.';
			}
			await scrollToError();
			return;
		}

		const fd = new FormData();
		fd.append('letter_id', ids);
		fd.append('recipient_name', recipientName);
		fd.append('message', letterMessage);
		fd.append('music', String(selected?.preview));
		fd.append('music_profile', String(selected?.album.cover_medium));
		fd.append('music_title', String(selected?.title));
		fd.append('privacy', privacy);
		fd.append('password', password ?? "-");
		fd.append('font', font);
		fd.append('show_sender', showSender ? 'yes' : 'no');
		fd.append('show_recipient', showRecipient ? 'yes' : 'no');
		fd.append('artist', String(selected.artist.name));
        fd.append('image', imageFile ? imageFile as Blob : "-");
		fd.append('video', videoFile ? videoFile as Blob : "-");
        fd.append('new_letterid', letterId);

		const ft = await fetch('/api/letters?path=edit', {
			method: 'POST',
			body: fd
		});
		const submitJson = await ft.json();

		if (submitJson['status_code'] !== 200) {
            if (submitJson['status_code'] === 'UNAUTHORIZED') {
                window.location.href = '/auth';
                return;
            }
			globalErr = ['PARAMETER_EMPTY', 'BAD_REQUEST'].includes(submitJson['error_code'])
				? 'Something went wrong, please try again later...'
				: '';
			idError =
				(submitJson['error_code'] === 'LENGTH_TOO_LONG' &&
					submitJson['message'].includes('letter_id')) ||
				submitJson['error_code'] === 'ID_OCCUPIED'
					? submitJson['message']
					: '';
			passError =
				submitJson['error_code'] === 'LENGTH_TOO_LONG' && submitJson['message'].includes('password')
					? submitJson['message']
					: '';
			fileError = submitJson['error_code'] === 'FILE_TOO_LARGE' ? submitJson['message'] : '';
			if (idError || passError) {
				adv = true;
				await scrollToError();
			}
			buttonLoad = false;
			dropdownClosed = false;
			uploadRef!.style.opacity = '1 !important';
		} else {
			editSuccess = true;
		}
	};

    const viewLetter = (letterId: string) => {
        window.location.href = `/letter/${letterId}`;
    }
</script>

{#if windowLoad}
	<div class="preloader">
		<div class="spinner"></div>
	</div>
{:else}
	<Navbar />

	<section class="new">
		<div class="container">
			<div class="desc">
				<h1>New Letter</h1>
				<p>Write a letter to someone...</p>
			</div>
			{#if !editSuccess}
				<form method="post" onsubmit={handeSubmit}>
					<label for="name">Recipient Name</label>
					<input
						type="text"
						id="name"
						placeholder="Alex Johnson"
						required
						bind:value={recipientName}
						disabled={buttonLoad}
					/>
					<label for="message">Your Message</label>
					<textarea
						name="message"
						id="message"
						required
						bind:value={letterMessage}
						disabled={buttonLoad}
					></textarea>
					<div class="music-picker">
						<label for="music">Music</label>
						<div class="input-wrap">
							<input
								type="text"
								placeholder="Type song title/artist"
								bind:value={query}
								oninput={search}
								disabled={buttonLoad}
							/>
							{#if selected}
								<button type="button" aria-label="Clear" class="clear" onclick={clearSelected}>
									<i class="ri-close-line"></i>
								</button>
							{/if}
						</div>

						{#if query.trim() && !selected && !dropdownClosed}
							<div class="dropdown">
								{#if loading}
									<div class="info-text">Searching...</div>
								{:else if results.length === 0}
									<div class="info-text"><i class="ri-alert-line"></i> Not Found</div>
								{:else if results.length > 0}
									{#each results as track}
										<div class="item-wrap">
											<div
												class="item"
												role="button"
												tabindex="0"
												onclick={() => select(track)}
												onkeydown={(e) => e.key === 'Enter' && select(track)}
											>
												<img src={track.album.cover_medium} alt={track.title} />
												<div class="info">
													<span class="title"
														>{track.title.length > 40
															? `${track.title.substring(0, 40)}...`
															: track.title}</span
													>
													<span class="artist">{track.artist.name}</span>
												</div>
											</div>
											<div class="btn">
												<button
													disabled={buttonLoad}
													type="button"
													class={currentPlayingId === track.id ? 'stop' : 'play'}
													aria-label={currentPlayingId === track.id ? 'Stop' : 'Play'}
													onclick={() => togglePlay(track)}
												>
													{#if !musicLoad || musicLoad !== track.id}
														<i
															class={currentPlayingId === track.id
																? 'ri-stop-line'
																: 'ri-play-line'}
														></i>
													{:else if musicLoad === track.id}
														<div class="spinner"></div>
													{/if}
												</button>
											</div>
										</div>
									{/each}
								{/if}
							</div>
						{/if}

						{#if selected}
							<div class="selected-info">
								<img src={selected.album.cover_medium} alt={selected.title} />
								<div class="info">
									<span class="title"
										>{selected.title.length > 40
											? `${selected.title.substring(0, 40)}...`
											: selected.title}</span
									>
									<span class="artist">{selected.artist.name}</span>
								</div>
								<button
									disabled={buttonLoad}
									type="button"
									aria-label={currentPlayingId === selected.id ? 'Stop' : 'Play'}
									class="play"
									onclick={() => togglePlay(selected!)}
								>
									{#if !musicLoad || musicLoad !== selected.id}
										<i class={currentPlayingId === selected.id ? 'ri-stop-line' : 'ri-play-line'}
										></i>
									{:else if musicLoad === selected.id}
										<div class="spinner"></div>
									{/if}
								</button>
							</div>
							{#if audio}
								<div class="duration">
									{duration}
								</div>
							{/if}
						{/if}
					</div>
					{#if musicError}
						<div class="error-input">Please select a music.</div>
					{/if}
					<div bind:this={uploadRef} class="file-upload">
						<label for="attach">Attachment</label>
						<span>Optional, add images or videos to your letter to make it more romantic...</span>
						<div class="upload-grid">
							<div class="upload-box" class:has-file={imageFile}>
								<input
									type="file"
									id="image-upload"
									accept="image/*"
									onchange={(e) => handleFile(e, 'image')}
									disabled={buttonLoad}
								/>
								{#if imagePreview}
									<div class="preview">
										<img src={imagePreview} alt="Preview" />
										<button
											type="button"
											aria-label="Remove image"
											class="remove"
											onclick={() => clearFile('image')}
											disabled={buttonLoad}
										>
											<i class="ri-close-line"></i>
										</button>
									</div>
								{:else}
									<label for="image-upload" class="upload-label">
										<i class="ri-image-line"></i>
										<span>Upload Image</span>
										<p>PNG, JPG, WEBP</p>
										<p>Max 5 MB</p>
									</label>
								{/if}
							</div>

							<div class="upload-box" class:has-file={videoFile}>
								<input
									type="file"
									id="video-upload"
									accept="video/*"
									onchange={(e) => handleFile(e, 'video')}
									disabled={buttonLoad}
								/>
								{#if videoPreview}
									<div class="preview">
										<video src={videoPreview} controls>
											<track kind="captions" />
										</video>
										<button
											type="button"
											aria-label="Remove video"
											class="remove"
											onclick={() => clearFile('video')}
											disabled={buttonLoad}
										>
											<i class="ri-close-line"></i>
										</button>
									</div>
								{:else}
									<label for="video-upload" class="upload-label">
										<i class="ri-video-line"></i>
										<span>Upload Video</span>
										<p>MP4, MOV, WEBM</p>
										<p>Max 20 MB</p>
									</label>
								{/if}
							</div>
							{#if fileError}
								<div class="error-input">{fileError}</div>
							{/if}
						</div>
					</div>

					<button
						type="button"
						class="adv"
						onclick={() => {
							handleCheckbox('adv');
						}}
						disabled={buttonLoad}
						>Advanced
						{#if !adv}
							<i class="ri-arrow-down-s-line"></i>
						{:else}
							<i class="ri-arrow-up-s-line"></i>
						{/if}
					</button>

					{#if adv}
						<section class="adv-menu">
							<div class="menu-row">
								<div class="menu-info">
									<div class="item">Privacy</div>
									<span class="desc">Manage who can access your letter.</span>
								</div>
								<div class="checkbox-container">
									<input
										type="checkbox"
										id="privacy"
										onchange={handlePrivacy}
										checked={privacy === 'public'}
									/>
									<div class="custom-checkmark"></div>
									<span class="status-text">{privacy}</span>
								</div>
							</div>
							<p class="helper-text">
								{#if privacy === 'public'}
									Anyone can browse for your letters and access it.
								{:else}
									Only the one who has the link can access this letter.
								{/if}
							</p>

							<div class="space"></div>

							<div class="menu-row">
								<div class="menu-info">
									<div class="item">View-Once</div>
									<span class="desc"
										>Enable this to burn the letter once viewed except the sender, the burned letter
										can still be accessed by the sender.</span
									>
								</div>
								<div class="checkbox-container">
									<input
										type="checkbox"
										id="view"
										onchange={() => {
											handleCheckbox('viewOnce');
										}}
										checked={viewOnce}
									/>
									<div class="custom-checkmark"></div>
									<span class="status-text">{viewOnce ? 'enabled' : 'disabled'}</span>
								</div>
							</div>

							<div class="space"></div>

							<div class="wrapper">
								<div class="menu-row">
									<div class="menu-info">
										<div class="item">Password</div>
										<span class="desc"
											>Enable a password for added privacy, only those with the password can access
											it.</span
										>
									</div>
									<div class="checkbox-container">
										<input
											type="checkbox"
											id="view"
											onchange={() => {
												handleCheckbox('pass');
											}}
											checked={usePassword}
										/>
										<div class="custom-checkmark"></div>
										<span class="status-text">{usePassword ? 'enabled' : 'disabled'}</span>
									</div>
								</div>
								{#if usePassword}
									<div class="input-wrap">
										<input
											type={showPassword ? 'text' : 'password'}
											name="password"
											id="password"
											placeholder="••••••••"
											oninput={handleInputPass}
											bind:value={password}
										/>
										<div class="checkbox-container">
											<input
												type="checkbox"
												id="view"
												onchange={() => {
													handleCheckbox('showPass');
												}}
												checked={showPassword}
											/>
											<div class="custom-checkmark"></div>
											<span class="status-text"
												>{showPassword ? 'Password showen' : 'Password hidden'}</span
											>
										</div>
									</div>
									{#if passError}
										<div class="error-input">{passError}</div>
									{/if}
								{/if}
							</div>

							<div class="space"></div>

							<div class="wrapper">
								<div class="menu-info">
									<div class="item">Font</div>
									<span class="desc">Choose a font you like for your letter.</span>
								</div>

								<div class="dropdown-container">
									<div class="custom-select">
										<select bind:value={font}>
											<option value="playwrite-nz" selected>Playwrite NZ</option>
											<option value="cause">Cause</option>
											<option value="comic-neue">Comic Neue</option>
											<option value="playwrite-br">Playwrite BR</option>
											<option value="dancing-sc">Dancing Script</option>
											<option value="cv">Caveat</option>
											<option value="ind-fl">Indie Flower</option>
										</select>
										<i class="ri-arrow-down-s-line"></i>
									</div>
								</div>

								<div class="preview" style="font-family: '{resolveFont(font)}', cursive;">
									{!letterMessage
										? 'Lorem ipsum, dolor sit amet consectetur adipisicing.'
										: letterMessage.length > 52
											? letterMessage.substring(0, 52)
											: letterMessage}
								</div>
							</div>

							<div class="space"></div>

							<div class="wrapper">
								<div class="menu-info">
									<div class="item">Custom URL</div>
									<span class="desc">Enter the reference ID for the letter you want.</span>
								</div>
								<div class="w">
									<div class="input-wrap">
										<input
											type="text"
											name="url"
											id="url"
											placeholder="put here..."
											bind:value={letterId}
											oninput={handleInputId}
										/>
									</div>
									<button type="button" aria-label="reload" onclick={randomId}
										><i class="ri-loop-right-line"></i></button
									>
								</div>
								{#if idError}
									<div class="error-input">{idError}</div>
								{/if}
								<p class="helper-text" style="color: black;">
									https://{window.location.hostname}/letter/{letterId}
								</p>
							</div>

							<div class="space"></div>

							<div class="menu-row">
								<div class="menu-info">
									<div class="item">Show Sender</div>
									<span class="desc">Enable this to let anyone know who's the sender is.</span>
								</div>
								<div class="checkbox-container">
									<input
										type="checkbox"
										id="view"
										onchange={() => {
											handleCheckbox('showSend');
										}}
										checked={showSender}
									/>
									<div class="custom-checkmark"></div>
									<span class="status-text">{showSender ? 'enabled' : 'disabled'}</span>
								</div>
							</div>

							<div class="space"></div>

							<div class="menu-row">
								<div class="menu-info">
									<div class="item">Show Recipient</div>
									<span class="desc">Enable this to let anyone know who's the recipient is.</span>
								</div>
								<div class="checkbox-container">
									<input
										type="checkbox"
										id="view"
										onchange={() => {
											handleCheckbox('showRecp');
										}}
										checked={showRecipient}
									/>
									<div class="custom-checkmark"></div>
									<span class="status-text">{showRecipient ? 'enabled' : 'disabled'}</span>
								</div>
							</div>
						</section>
					{/if}

					{#if globalErr}
						<div class="wrap-error">
							<div class="error">Something went wrong...</div>
						</div>
					{/if}

					<div class="btns">
						<button style="min-width: 25%;" disabled={buttonLoad} class="submit" type="submit">
							{#if buttonLoad}
								<span class="button-spinner"></span>
							{:else}
								Save Changes <i class="ri-heart-add-2-line"></i>
							{/if}</button
						>
					</div>
				</form>
			{:else}
				<section class="success-w">
					<div class="success">
						<div class="icon-wrap">
							<i class="ri-mail-check-line"></i>
						</div>

						<span class="label">
							<i class="ri-checkbox-circle-fill"></i>
							Letter
						</span>

						<h2>Successfully edited!</h2>
						<p class="sub">
							Successfully edited a letter for: <strong>{recipientName}</strong>.
						</p>

						<div class="url-box">
							<i class="ri-links-line url-icon"></i>
							<span class="url-text">{window.location.hostname}/letter/{letterId}</span>
							<button
								class="copy-btn"
								class:done={copied}
								onclick={copyLink}
								aria-label="Copy link"
							>
								<i class={copied ? 'ri-check-line' : 'ri-file-copy-line'}></i>
								{#if copied}<span class="tip">Copied!</span>{/if}
							</button>
						</div>

						<div class="divider"></div>

						<div class="actions">
							<button class="btn-pri" onclick={(() => viewLetter(letterId))}>
								<i class="ri-eye-line"></i> View letter
							</button>
						</div>
					</div>
				</section>
			{/if}
		</div>
	</section>

	<Footer />
{/if}
