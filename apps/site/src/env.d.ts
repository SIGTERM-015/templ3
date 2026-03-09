type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
	interface Locals extends Runtime {}
}

interface ImportMetaEnv {
	readonly PUBLIC_CMS_URL?: string
	readonly PUBLIC_CLERK_PUBLISHABLE_KEY?: string
	readonly CLERK_SECRET_KEY?: string
	readonly SPOTIFY_CLIENT_ID?: string
	readonly SPOTIFY_CLIENT_SECRET?: string
	readonly SPOTIFY_REFRESH_TOKEN?: string
	readonly PAYLOAD_API_KEY?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
