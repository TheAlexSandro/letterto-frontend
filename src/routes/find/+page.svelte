<script lang="ts">
	import Navbar from '../../components/navbar/navbar.svelte';
	import Footer from '../../components/footer/footer.svelte';
	import './page.css';
	import Letter from '../../components/letter/letter.svelte';

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

	let buttonLoad = $state(false);
	let letters: Letter[] = $state([]);
	let total = $state(0);
	let offset = $state(1);
	let isFetching = $state(false);
	let searched = $state(false);
	let noResult = $state(false);
	let sentinel: HTMLElement | null = $state(null);
	let observer: IntersectionObserver | null = null;
	let name = $state('');
	let fetchDone = $state(false);

	const setupObserver = () => {
		if (observer) observer.disconnect();
		observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					fetchMore();
				}
			},
			{ threshold: 1.0 }
		);
		if (sentinel) observer.observe(sentinel);
	};

	const fetchMore = async () => {
		if (isFetching || fetchDone) return;
		if (letters.length >= total && total !== 0) return;

		isFetching = true;
		const res = await fetch(
			`/api/letters?path=search&recipient_name=${encodeURIComponent(name)}&offset=${offset}`
		);
		const json = (await res.json()) as App.Platform['resp'];

		if (json['status_code'] === 200 && json['data']['letters']) {
			letters = [...letters, ...json['data']['letters']];
			total = json['data']['total'];
			offset++;
		} else {
			fetchDone = true;
		}

		isFetching = false;
	};

	const find = async (e: Event) => {
		e.preventDefault();
		if (!name) return;

		letters = [];
		total = 0;
		offset = 1;
		searched = false;
		noResult = false;
		buttonLoad = true;
		fetchDone = false;

		const res = await fetch(
			`/api/letters?path=search&recipient_name=${encodeURIComponent(name)}&offset=1`
		);
		const json = (await res.json()) as App.Platform['resp'];

		buttonLoad = false;
		searched = true;

		if (json['status_code'] === 200 && json['data']['letters']?.length > 0) {
			letters = json['data']['letters'];
			total = json['data']['total'];
			offset = 2;
			setTimeout(() => setupObserver(), 100);
		} else {
			noResult = true;
		}
	};
</script>

<Navbar />

<section class="find">
	<div class="cont">
		<h1>Find a letter here</h1>
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<form method="post" onsubmit={find}>
			<i class="ri-search-2-line"></i>
			<input type="text" name="name" id="name" placeholder="Recipient name..." bind:value={name} />
			<button disabled={buttonLoad} type="submit">
				{#if buttonLoad}
					<span class="button-spinner"></span>
				{:else}
					Search
				{/if}
			</button>
		</form>

		{#if searched}
			<div class="results">
				{#if noResult}
					<p class="no-result">No letters found.</p>
				{:else}
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
						/>
					{/each}

					<div bind:this={sentinel} class="sentinel">
						{#if isFetching}
							<div class="spinner-wrap">
								<span class="spinner"></span>
							</div>
						{/if}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</section>

<Footer />
