const previewCache = new Map<number, { url: string; fetchedAt: number }>();
const CACHE_TTL = 1000 * 60 * 3;

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
		'playwrite-no': `"Playwrite NO; cursive"`,
		alike: `"Alike"; serif`
	} as const;
	return dt[font as keyof typeof dt];
};

// export const randomFont = () => {
// 	const dt = ['playwrite-nz', 'cause', 'comic-neue', 'playwrite-br', 'dancing-sc', 'cv', 'ind-fl', 'playwrite-de', 'playwrite-no', 'alike'];
// 	const a = Math.floor(Math.random() * dt.length);
// 	return dt[a];
// };

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
