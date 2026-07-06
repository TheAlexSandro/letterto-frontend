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
		edit = null,
		hide_sender = null,
		warn = null,
		view = 0
	} = $props();
	import deezer from '$lib/assets/deezer2.svg';
	import { resolveFont } from '$lib/utils/utils';
	import { stripHTML, sanitizeText } from '$lib/utils/utils';
	import { onMount } from 'svelte';
	import { isDeletingLetter, openDropdownId } from '$lib/stores/letter';

	let copied = $state(false);
	let buttonLoad = $state(false);
	let windowWidth = $state(0);
	let dropdownRef = $state<HTMLDivElement | null>(null);

	let dropdownOpen = $derived($openDropdownId === letter_id);

	onMount(() => {
		windowWidth = window.innerWidth;
		const handleResize = () => {
			windowWidth = window.innerWidth;
		};
		window.addEventListener('resize', handleResize);

		const handleClickOutside = (e: MouseEvent) => {
			if (dropdownRef && !dropdownRef.contains(e.target as Node)) {
				if ($openDropdownId === letter_id) {
					openDropdownId.set(null);
				}
			}
		};
		document.addEventListener('click', handleClickOutside);

		return () => {
			window.removeEventListener('resize', handleResize);
			document.removeEventListener('click', handleClickOutside);
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
			buttonLoad = true;
			isDeletingLetter.set(true);
			openDropdownId.set(null);
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

	const formatCompact = (num: number): string => {
		return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
			.format(num)
			.toLowerCase();
	};

	const renderMessage = (message: string) => {
		const m = stripHTML(sanitizeText(message));
		return m.length > 70 ? `${m.substring(0, 70)}...` : m;
	};
</script>

<section class="l">
	<div class="top">
		<div class="info">
			<div class="s">
				<i class="ri-mail-line"></i>
				<div class="c">
					{#if !hide_sender}
						<span><strong>From:</strong><em>{sender ?? 'anonymous'}</em></span>
					{/if}
					<span><strong>To:</strong><em>{recipient_name ?? 'anonymous'}</em></span>
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
			<div class="btn" bind:this={dropdownRef}>
				<button
					id="menu-trigger"
					aria-label="Actions"
					disabled={buttonLoad || (!buttonLoad && $isDeletingLetter)}
					onclick={(e) => {
						e.stopPropagation();
						openDropdownId.set(dropdownOpen ? null : letter_id);
					}}
				>
					{#if !buttonLoad}
						<i class={dropdownOpen ? 'ri-close-line open' : 'ri-more-2-fill'}></i>
					{:else}
						<span class="button-spinner"></span>
					{/if}
				</button>
				{#if dropdownOpen}
					<div class="dropdown">
						<button
							class="dropdown-item a"
							onclick={(e) => {
								e.stopPropagation();
								copyLink(letter_id);
							}}
							disabled={copied || buttonLoad}
						>
							{#if !copied}
								<i class="ri-file-copy-line"></i>
								<span>Copy Link</span>
							{:else}
								<i class="ri-check-line"></i>
								<span>Copied!</span>
							{/if}
						</button>
						<button
							class="dropdown-item b"
							disabled={buttonLoad}
							onclick={(e) => {
								e.stopPropagation();
								editOpen(letter_id);
							}}
						>
							<i class="ri-pencil-line"></i>
							<span>Edit</span>
						</button>
						<button
							class="dropdown-item danger"
							disabled={buttonLoad}
							onclick={(e) => {
								e.stopPropagation();
								delLetter(letter_id);
							}}
						>
							<i class="ri-delete-bin-line"></i>
							<span>Delete</span>
						</button>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	{#if letter_id}
		<a href="/l/{letter_id}" data-sveltekit-preload-data="off">
			<div class="content">
				{#if is_locked}
					<div class="locked">
						<i class="ri-lock-line" id="a"></i>
						<b>Letter Locked</b>
						<span>Password is required to view this letter.</span>
					</div>
				{:else}
					<p style="font-family: {resolveFont(font)};">
						{renderMessage(message)}
					</p>
				{/if}
			</div>
		</a>
	{:else}
		<div class="content">
			<p style="font-family: {resolveFont(font)};">
				{renderMessage(message)}
			</p>
		</div>
	{/if}

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
	{#if edit === 'true'}
		<div class="info-bot">
			{#if warn !== '-'}
				<div class="bottom">
					{#if warn === '1'}
						<div class="warn">
							<i class="ri-alert-line"></i> Violates Terms of Service.
						</div>
					{:else}
						<div class="ban">
							<i class="ri-spam-3-line"></i> Letter Banned.
						</div>
					{/if}
				</div>
			{/if}

			<div class="view">
				<i class="ri-eye-line"></i>
				{formatCompact(Number(view))}x viewed
			</div>
		</div>
	{/if}
</section>

<style>
	.l {
		background: #fff;
		border-radius: 16px;
		min-width: 35%;
		max-width: 35%;
		padding: 16px;
		border: 1px solid var(--color-border);
		display: flex;
		flex-direction: column;
		gap: 12px;
		transition: all 0.2s ease-in-out;
	}

	.l:hover {
		box-shadow: 0 4px 24px rgba(109, 40, 217, 0.3);
		transition: all 0.2s ease-in-out;
	}

	.l .top {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: flex-start;
		padding-bottom: 10px;
		border-bottom: 1px solid var(--color-border);
	}

	.l .info {
		display: flex;
		flex-direction: row;
		border-radius: 10px;
		align-items: center;
		gap: 10px;
		margin-bottom: 0;
	}

	.l .info i {
		font-size: 18px;
		background: #ede9fe;
		color: var(--color-primary);
		padding: 8px;
		border-radius: 8px;
	}

	.l .info .s {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 10px;
	}

	.l .info .c {
		display: flex;
		flex-direction: column;
		font-size: 13px;
		gap: 2px;
	}

	.l .info .c strong {
		font-weight: var(--font-semibold);
		margin-right: 10px;
	}

	.l .info .c em {
		font-style: normal;
		font-weight: var(--font-semibold);
		color: var(--color-primary);
	}

	.l .info .c b {
		font-style: normal;
		font-weight: var(--font-medium);
		color: var(--color-text-muted) !important;
	}

	.l .top .date {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 0;
		padding-left: 10px;
		border-left: none;
		margin: 0;
		height: 40px;
		line-height: 1;
		color: var(--color-text-secondary);
		border-left: 1px solid var(--color-border);
	}

	.l .top .date span {
		font-size: 13px;
		font-weight: var(--font-medium);
	}

	.l .top .date i {
		font-size: 18px;
		color: var(--color-primary);
	}

	.l .content {
		font-size: 14px;
		font-weight: var(--font-regular);
		color: var(--color-text-primary);
		user-select: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		min-height: 15vh;
		text-align: unset;
		justify-content: center;
	}

	.l a {
		text-decoration: none;
		color: var(--color-text-primary);
	}

	.l .content .locked {
		display: flex;
		flex-direction: column;
		gap: 5px;
		align-items: center;
		padding: 10px;
		border-radius: 5px;
		justify-content: center;
		text-align: center;
		background: var(--color-accent-light);
	}

	.l .content .locked i {
		font-size: 20px;
		padding: 10px;
		color: var(--color-accent);
		background: #6c28d91b;
		border-radius: 50px;
	}

	.l .content .locked b {
		font-weight: var(--font-semibold);
	}

	.l .content .locked span {
		font-size: 13px;
	}

	.l .footer {
		border-top: 1px solid var(--color-border);
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		overflow: hidden;
		padding-top: 10px;
		padding-right: 16px;
	}

	.l .footer .music {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 12px;
	}

	.l .footer .music img {
		width: 80px;
		height: 80px;
		object-fit: cover;
		border-radius: 10px;
		flex-shrink: 0;
	}

	.l .footer .music .desc {
		display: flex;
		flex-direction: column;
		gap: 3px;
		margin: 0;
		padding: 5px 0;
		overflow-y: auto;
		max-height: 90px;
	}

	.l .footer .music .desc::-webkit-scrollbar {
		width: 4px;
		height: 7px;
	}

	.l .footer .music .desc::-webkit-scrollbar-thumb {
		background: rgba(63, 55, 55, 0.2);
		border-radius: 20px;
	}

	.l .footer .music .desc::-webkit-scrollbar-thumb:hover {
		background: #6c5d5d82;
	}

	.l .footer .music .desc .title {
		font-size: 15px;
		font-weight: var(--font-semibold);
	}

	.l .footer .music .desc .artist {
		font-size: 13px;
		color: var(--color-text-secondary);
		margin: 0;
	}

	.l .footer .music .desc .song {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 3px 8px;
		background: #6e42d32b;
		color: var(--color-primary);
		font-size: 12px;
		font-weight: var(--font-medium);
		border-radius: 20px;
		width: fit-content;
		margin-top: 2px;
	}

	.l .footer .music .desc .song i {
		font-size: 13px;
	}

	.l .footer .deezer-side {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 10px;
	}

	.l .footer .deezer-side img {
		width: 40px;
		object-fit: contain;
		margin: 0;
		padding-left: 3px;
	}

	/* .l .footer .deezer-side button {
		display: flex;
		align-items: center;
		gap: 6px;
		border: 1px solid var(--color-border);
		border-radius: 20px;
		padding: 4px 12px;
		font-size: 13px;
		font-weight: var(--font-medium);
		color: var(--color-text-primary);
		text-decoration: none;
		white-space: nowrap;
		transition: background 0.2s;
		background: #fff;
		cursor: pointer;
	}

	.l .footer .deezer-side button:hover {
		background: #f3eeff;
		color: var(--color-primary);
		border-color: var(--color-primary);
	}

	.l .footer .deezer-side button i {
		font-size: 14px;
	} */

	.l .btn {
		position: relative;
	}

	.l .btn .button-spinner {
		border-top-color: var(--color-accent);
	}

	.l .btn #menu-trigger {
		padding: 7px;
		border-radius: 8px;
		outline: 0;
		color: var(--color-text-secondary);
		background: var(--color-accent-light);
		border: 1px solid var(--color-accent);
		cursor: pointer;
		display: flex;
		align-items: center;
		transition: background 0.15s;
		font-family: inherit;
	}

	.l .btn #menu-trigger i {
		font-size: 16px;
		color: var(--color-text-secondary);
		transition:
			transform 0.2s ease,
			opacity 0.15s ease;
	}

	.l .btn #menu-trigger i.open {
		transform: rotate(90deg);
	}

	.l .btn #menu-trigger:hover {
		background: #f3eeff;
		border-color: var(--color-primary);
	}

	.l .btn #menu-trigger:hover i {
		color: var(--color-primary);
	}

	.l .btn #menu-trigger:disabled {
		opacity: 0.6;
		cursor: default;
	}

	@keyframes dropdown-in {
		from {
			opacity: 0;
			transform: translateY(-6px) scale(0.97);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	.l .btn .dropdown {
		position: absolute;
		top: calc(100% + 6px);
		right: 0;
		background: #fff;
		border: 1px solid var(--color-border);
		border-radius: 10px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
		min-width: 140px;
		z-index: 50;
		overflow: hidden;
		padding: 10px;
		animation: dropdown-in 0.15s ease forwards;
		transform-origin: top right;
		gap: 3px;
	}

	.l .btn .dropdown-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 12px;
		border: 0;
		outline: 0;
		background: transparent;
		cursor: pointer;
		font-size: 13px;
		font-weight: var(--font-medium);
		color: var(--color-text-primary);
		border-radius: 7px;
		transition: background 0.15s;
		text-align: left;
		font-family: inherit;
	}

	.l .btn .dropdown-item i {
		font-size: 15px;
	}

	.l .btn .dropdown-item:hover {
		background: var(--color-accent);
		color: white;
	}

	.l .btn .dropdown-item:hover.danger {
		background: var(--color-danger);
		color: white;
	}

	.l .btn .dropdown-item:disabled {
		opacity: 0.5;
		cursor: default;
	}

	.l .info-bot {
		display: flex;
		flex-direction: row;
		align-items: center;
		line-height: 1;
	}

	.l .info-bot .bottom {
		font-size: 12px;
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 7px;
	}

	.l .info-bot .bottom .warn {
		color: rgb(139, 139, 37);
	}

	.l .info-bot .bottom .ban {
		color: red;
	}

	.l .info-bot .view {
		font-size: 13px;
		margin-left: auto;
		color: #333333dd;
	}

	@media screen and (max-width: 600px) {
		.l {
			min-width: 100%;
			max-width: 100%;
		}

		.l .footer .deezer-side img {
			width: 40px;
			margin: 0;
		}

		.l .footer .music img {
			width: 70px;
			height: 70px;
		}

		.l .footer .music {
			height: 80px;
		}

		.l .footer .music .desc .title {
			font-size: 14px;
		}

		.l .footer .music .desc .artist {
			font-size: 12px;
		}
	}

	@media screen and (min-width: 768px) and (max-width: 1024px) {
		.l {
			min-width: 55%;
			max-width: 55%;
		}

		.l .content {
			min-height: 10vh;
		}
	}
</style>
