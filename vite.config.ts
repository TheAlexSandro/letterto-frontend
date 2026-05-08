import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		allowedHosts: ['usc-nokia-relatives-packing.trycloudflare.com']
	},
	assetsInclude: ['**/*.lottie']
});
