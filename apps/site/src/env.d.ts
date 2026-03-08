type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
	interface Locals extends Runtime {}
}

interface ImportMetaEnv {
	readonly PUBLIC_CMS_URL?: string
	readonly SPOTIFY_CLIENT_ID?: string
	readonly SPOTIFY_CLIENT_SECRET?: string
	readonly SPOTIFY_REFRESH_TOKEN?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
