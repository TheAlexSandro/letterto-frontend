// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Platform {
			env: Env;
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties;
			resp: {
				status_code: number;
				message: string;
				data: any;
				error_code: string;
			};
		}

		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
	}
	module '*.lottie' {
		const src: string;
		export default src;
	}
}

export {};
