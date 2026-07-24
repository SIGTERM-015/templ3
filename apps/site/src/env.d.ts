type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
	interface Locals extends Runtime {}
}

interface ImportMetaEnv {
	readonly PUBLIC_CMS_URL?: string
	readonly PUBLIC_CLERK_PUBLISHABLE_KEY?: string
	readonly CLERK_SECRET_KEY?: string
	readonly LASTFM_API_KEY?: string
	readonly LASTFM_USERNAME?: string
	readonly PAYLOAD_API_KEY?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}

declare module '*?raw' {
	const content: string
	export default content
}
