import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		allowedHosts: ['carol-poet-arc-karl.trycloudflare.com']
	},
	assetsInclude: ['**/*.lottie']
});
