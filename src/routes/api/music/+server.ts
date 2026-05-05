import { json } from '@sveltejs/kit';

export async function GET({ url }) {
	const query = url.searchParams.get('q') ?? '';
	const res = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=10`);
	const data = await res.json();
	return json(data);
}
