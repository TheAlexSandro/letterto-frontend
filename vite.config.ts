import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		allowedHosts: ['dust-couple-may-adjustment.trycloudflare.com']
	},
	assetsInclude: ['**/*.lottie']
});
