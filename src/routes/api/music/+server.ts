import { DEEZER_API } from '$env/static/private';
import { json } from '@sveltejs/kit';

export async function GET({ url }) {
	const path = url.searchParams.get('path') ?? '';

	let query;
	let trackId;
	if (path === 'search') {
		query = url.searchParams.get('q') ?? '';
	}
	if (path === 'preview') {
		trackId = url.searchParams.get('id') ?? '';
	}

	const urls =
		path === 'search'
			? `${DEEZER_API}/search?q=${encodeURIComponent(String(query))}&limit=10`
			: `${DEEZER_API}/track/${trackId}`;

	const res = await fetch(urls);
	const data = await res.json();
	return json(data);
}
