import { json } from '@sveltejs/kit';

export async function GET({ url, request, platform }) {
	const BACKEND_URL = platform?.env?.BACKEND_URL;
	const path = url.searchParams.get('path');

	let id;
	let password;
	let edit;
	let name;
	if (path !== 'new') {
		id = url.searchParams.get('id');
		password = url.searchParams.get('password');
		edit = url.searchParams.get('edit');
		name = url.searchParams.get('recipient_name');
	}

	const bind =
		path === 'getInfo'
			? `?id=${id}${edit ? `&edit=${edit}` : ``}`
			: path === 'verifyPassword'
				? `?id=${id}&password=${password}`
				: path === 'remove'
					? `?id=${id}`
					: path === 'search'
						? `?recipient_name=${name}`
						: '';

	const ft = await fetch(`${BACKEND_URL}/letter/${path}${bind}`, {
		method: ['getInfo', 'myLetters', 'search'].includes(path as string) ? 'GET' : 'POST',
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

export async function POST({ url, request, platform }) {
	const BACKEND_URL = platform?.env?.BACKEND_URL;
	const path = url.searchParams.get('path');
	const form = await request.formData();
	const fd = new FormData();

	fd.append('letter_id', (form.get('letter_id') as string) || '');
	fd.append('recipient_name', (form.get('recipient_name') as string) || '');
	fd.append('message', (form.get('message') as string) || '');
	fd.append('music', (form.get('music') as string) || '');
	fd.append('music_profile', (form.get('music_profile') as string) || '');
	fd.append('music_title', (form.get('music_title') as string) || '');
	fd.append('privacy', (form.get('privacy') as string) || '');
	fd.append('password', (form.get('password') as string) || '');
	fd.append('font', (form.get('font') as string) || '');
	fd.append('show_sender', (form.get('show_sender') as string) || '');
	fd.append('show_recipient', (form.get('show_recipient') as string) || '');
	fd.append('artist', (form.get('artist') as string) || '');

	const image = form.get('image') || '-';
	const video = form.get('video') || '-';

	fd.append('image', image);
	fd.append('video', video);

	if (path === 'edit') {
		fd.append('new_letterid', (form.get('new_letterid') as string) || '');
	}

	const ft = await fetch(`${BACKEND_URL}/letter/${path}`, {
		method: 'POST',
		body: fd,
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
