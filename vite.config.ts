import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		allowedHosts: ['tunes-blank-screensaver-inspired.trycloudflare.com']
	},
	assetsInclude: ['**/*.lottie']
});
