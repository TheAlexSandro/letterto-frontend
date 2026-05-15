import { BACKEND_URL } from '$env/static/private';
import { json } from '@sveltejs/kit';

export async function GET({ url, request }) {
	const path = url.searchParams.get('path');
	const endpoint = url.searchParams.get('ep');

	const ft = await fetch(`${BACKEND_URL}/${path}/${endpoint}`, {
		method: 'GET',
		credentials: 'include',
		headers: {
			Accept: 'application/json',
			Cookie: request.headers.get('cookie') || ''
		}
	});
	const data = await ft.json();
	const response = json(data);
	const cookie = ft.headers.get('set-cookie');
	if (cookie) {
		response.headers.set('set-cookie', cookie);
	}

	return response;
}

export async function POST({ url, request }) {
	const path = url.searchParams.get('path');
	const endpoint = url.searchParams.get('ep');
	const contentType = request.headers.get('content-type') || '';
	const body = contentType.includes('application/json') ? await request.json() : null;

	const ft = await fetch(`${BACKEND_URL}/${path}/${endpoint}`, {
		method: 'POST',
		credentials: 'include',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			Cookie: request.headers.get('cookie') || ''
		},
		...(body ? { body: JSON.stringify(body) } : {})
	});

	const data = await ft.json();
	const response = json(data);
	const cookie = ft.headers.get('set-cookie');
	if (cookie) response.headers.set('set-cookie', cookie);

	return response;
}
