import { BACKEND_URL } from '$env/static/private';

export async function apiRequest(path: string, method: string = 'GET', data: any = null, type: 'json' | 'form-data' | 'url-encoded' = 'json') {
    const url = `${BACKEND_URL}/${path}`;
    const headers: Record<string, string> = {};
    let body: any;

    if (method !== 'GET' && data) {
        if (type === 'json') {
            headers['Content-Type'] = 'application/json';
            body = JSON.stringify(data);
        } else if (type === 'url-encoded') {
            headers['Content-Type'] = 'application/x-www-form-urlencoded';
            body = new URLSearchParams(data).toString();
        } else if (type === 'form-data') {
            body = data;
        }
    }

    const res = await fetch(url, { method, headers, body });
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return await res.json();
    }
    return await res.text();
}