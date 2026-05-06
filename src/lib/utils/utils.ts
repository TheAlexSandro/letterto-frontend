const previewCache = new Map<number, { url: string; fetchedAt: number }>();
const CACHE_TTL = 1000 * 60 * 3;

export const resolveFont = (font: string) => {
	const dt = {
		'playwrite-nz': 'Playwrite NZ Guides',
		cause: 'Cause',
		'comic-neue': 'Comic Neue',
		'playwrite-br': 'Playwrite BR',
		'dancing-sc': 'Dancing Script',
		cv: 'Caveat',
		'ind-fl': 'Indie Flower'
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
