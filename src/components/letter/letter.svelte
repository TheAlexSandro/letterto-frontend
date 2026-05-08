<script lang="ts">
	let {
		letter_id = null,
		message = null,
		music_profile = null,
		music_title = null,
		created_at = null,
		recipient_name = null,
		sender = null,
		font = null,
		is_locked = null,
		artis = null,
		edit = null
	} = $props();
	import deezer from '$lib/assets/deezer2.svg';
	import './page.css';
	import { resolveFont } from '$lib/utils/utils';
	import { stripHTML } from '$lib/utils/utils';
	import { onMount } from 'svelte';

	let copied = $state(false);
	let letterLoad = $state(false);
	let buttonLoad = $state(false);
	let windowWidth = $state(0);

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

	const copyLink = (letterId: string) => {
		const url = `${window.location.hostname}/l/${letterId}`;
		navigator.clipboard.writeText(url).catch(() => {});
		copied = true;
		setTimeout(() => (copied = false), 1800);
	};

	const editOpen = (letterId: string) => {
		window.location.href = `/l/edit/${letterId}`;
	};

	const delLetter = async (letterId: string) => {
		const c = window.confirm(
			'Are you sure you want to delete this letter? The message, the image/video in this letter will also be deleted.'
		);
		if (c) {
			letterLoad = true;
			const ft = await fetch(`/api/letters?path=remove&id=${letterId}`);
			const jsons = (await ft.json()) as App.Platform['resp'];

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

<section class="letter">
	<div class="top">
		<div class="info">
			<div class="s">
				<i class="ri-mail-line"></i>
				<div class="c">
					<span><strong>From:</strong><em>{sender}</em></span>
					<span><strong>To:</strong><em>{recipient_name}</em></span>
					{#if edit === 'true'}
						<span><strong>Created:</strong><b>{created_at}</b></span>
					{/if}
				</div>
			</div>
		</div>
		{#if edit !== 'true'}
			<div class="date">
				<i class="ri-calendar-todo-line"></i>
				<span>{created_at}</span>
			</div>
		{:else}
			<div class="btn">
				<button
					id="trans"
					aria-labelledby="copy"
					onclick={() => copyLink(letter_id)}
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
					onclick={() => editOpen(letter_id)}><i class="ri-pencil-line"></i></button
				>
				<button
					disabled={buttonLoad}
					id="red"
					aria-labelledby="remove"
					onclick={() => delLetter(letter_id)}><i class="ri-delete-bin-line"></i></button
				>
			</div>
		{/if}
	</div>

	<a href="/l/{letter_id}" data-sveltekit-preload-data="off">
		<div class="content">
			{#if is_locked === 'true'}
				<div class="locked"><i class="ri-lock-line" id="a"></i> Content Locked</div>
			{:else}
				<p style="font-family: {resolveFont(font)};">
					{stripHTML(message).length > 40
						? stripHTML(message).substring(0, 40) + '...'
						: stripHTML(message)}
				</p>
			{/if}
		</div>
	</a>

	<div class="footer">
		<div class="music">
			<img src={music_profile} alt="Music Profile" />
			<div class="desc">
				<span class="title"
					>{music_title.length > 40 ? music_title.substring(0, 40) + '...' : music_title}</span
				>
				<span class="artist">{artis}</span>
				<span class="song"><i class="ri-bar-chart-horizontal-line"></i> Deezer</span>
			</div>
		</div>
		<div class="deezer-side">
			<img src={deezer} alt="Deezer Logo" />
		</div>
	</div>
</section>
