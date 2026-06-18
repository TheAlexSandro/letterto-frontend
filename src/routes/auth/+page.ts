export const load = ({ url }) => {
	const redirect = url.searchParams.get('redirect') ?? 'dashboard';
	return { redirect };
};
