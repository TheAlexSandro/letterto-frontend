import { BACKEND_URL } from '$env/static/private';
import { json } from '@sveltejs/kit';

export async function GET() {
	const ft = await fetch(`${BACKEND_URL}/`, {
		method: 'GET',
		credentials: 'include',
		headers: {
			Accept: 'application/json',
		}
	});
	const data = await ft.json();
	const response = json(data);
	return response;
}