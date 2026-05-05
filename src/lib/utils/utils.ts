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
