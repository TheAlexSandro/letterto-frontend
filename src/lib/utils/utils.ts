import DOMPurify from 'dompurify';

const previewCache = new Map<number, { url: string; fetchedAt: number }>();
const CACHE_TTL = 1000 * 60 * 3;

interface LoggedIn {
	name: string;
	role: 'user' | 'admin' | 'owner' | 'banned';
	user_id: string;
	username: string;
}

export const resolveFont = (font: string) => {
	const dt = {
		'playwrite-nz': `"Playwrite NZ Guides"; cursive`,
		cause: 'Cause',
		'comic-neue': `"Comic Neue"; cursive`,
		'playwrite-br': `"Playwrite BR"; cursive`,
		'dancing-sc': `"Dancing Script"; cursive`,
		cv: 'Caveat',
		'ind-fl': `"Indie Flower"; cursive`,
		'playwrite-de': `"Playwrite DE SAS"; cursive`,
		'playwrite-no': `"Playwrite NO"; cursive`,
		alike: `"Alike"; serif`
	} as const;
	return dt[font as keyof typeof dt];
};

export const getFreshPreview = async (trackId: number): Promise<string | null> => {
	const cached = previewCache.get(trackId);
	const now = Date.now();

	if (cached && now - cached.fetchedAt < CACHE_TTL) {
		return cached.url;
	}

	const res = await fetch(`/api/music?path=preview&id=${trackId}`);
	const data = (await res.json()) as any;
	const url: string = data['preview'];

	if (!url) return null;

	previewCache.set(trackId, { url, fetchedAt: now });
	return url;
};

export const stripHTML = (html: string) => {
	const doc = new DOMParser().parseFromString(html, 'text/html');
	return doc.body.textContent || '';
};

export const isEmpty = (html: string) => {
	if (!html) return true;
	const cleanText = html.replace(/<[^>]*>/g, '').trim();
	return cleanText === '';
};

export const generateID = (length: number) => {
	const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	const panjangKarakter = characters.length;
	let result = '';

	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * panjangKarakter));
	}

	return result;
};

export const isLoggedIn = async () => {
	const ft = await fetch(`/api/req?path=user&ep=accountInfo`);
	if (!ft.ok) return 'error';
	const data = (await ft.json()) as App.Platform['resp'];
	if (data['status_code'] !== 200) {
		if (data['error_code'] === 'UNAUTHORIZED') return false;
		return 'error';
	}
	return data.data as LoggedIn;
};

export const sanitize = (text: string): string => {
	if (!text) return '';

	const t = text
		.replace(/&nbsp;/gi, ' ')
		.replace(/&amp;/gi, '&')
		.replace(/&lt;/gi, '<')
		.replace(/&gt;/gi, '>')
		.replace(/&quot;/gi, '"')
		.replace(/&#39;/gi, "'")
		.replace(/\u00A0/g, ' ')
		.replace(/\u200B/g, '')
		.replace(/\u200C/g, '')
		.replace(/\u200D/g, '')
		.replace(/\uFEFF/g, '')
		.replace(/[ \t]+/g, ' ')
		.replace(/\n{3,}/g, '\n\n')
		.trim();

	return DOMPurify.sanitize(t, {
		ALLOWED_TAGS: [
			'span',
			'p',
			'div',
			'ul',
			'ol',
			'li',
			'br',
			'hr',
			'b',
			'i',
			'strong',
			'em',
			'u',
			's',
			'blockquote',
			'pre',
			'code',
			'h1',
			'h2',
			'h3',
			'h4',
			'h5',
			'h6',
			'img',
			'video',
			'source',
			'a'
		],
		ALLOWED_ATTR: [
			'class',
			'style',
			'src',
			'alt',
			'width',
			'height',
			'controls',
			'poster',
			'type',
			'href'
		],
		FORBID_TAGS: ['meta', 'script', 'style', 'iframe', 'object', 'embed', 'link', 'base']
	});
};
