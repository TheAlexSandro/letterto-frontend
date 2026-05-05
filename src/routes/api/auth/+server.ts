import { BACKEND_URL } from '$env/static/private';
import { json } from '@sveltejs/kit';

export async function GET({ url, request }) {
	const path = url.searchParams.get('path');

	let name;
	let username;
	let password;
	if (path !== 'accountInfo') {
		name = url.searchParams.get('name') ?? '';
		username = url.searchParams.get('username') ?? '';
		password = url.searchParams.get('password') ?? '';
	}
	const bind =
		path === 'signIn'
			? `?username=${username}&password=${password}`
			: path === 'signUp'
				? `?name=${name}&username=${username}&password=${password}`
				: ``;

	const ft = await fetch(`${BACKEND_URL}/auth/${path}${bind}`, {
		method: path === 'accountInfo' ? 'GET' : 'POST',
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
