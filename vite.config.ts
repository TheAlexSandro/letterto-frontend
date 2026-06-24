import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		allowedHosts: ['worked-lexmark-joins-heat.trycloudflare.com']
	},
	assetsInclude: ['**/*.lottie']
});
