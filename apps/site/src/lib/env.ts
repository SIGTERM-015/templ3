import { env } from 'cloudflare:workers'

type SecretsStoreSecret = { get(): Promise<string> }

// Build-time values. Vite only inlines `import.meta.env.X` written out literally, so a
// dynamic `import.meta.env[name]` would see none of the non-PUBLIC_ variables CI passes in.
const BUILD_ENV: Record<keyof ImportMetaEnv, string | undefined> = {
  PUBLIC_CMS_URL: import.meta.env.PUBLIC_CMS_URL,
  PUBLIC_CLERK_PUBLISHABLE_KEY: import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: import.meta.env.CLERK_SECRET_KEY,
  LASTFM_API_KEY: import.meta.env.LASTFM_API_KEY,
  LASTFM_USERNAME: import.meta.env.LASTFM_USERNAME,
  PAYLOAD_API_KEY: import.meta.env.PAYLOAD_API_KEY,
}

/**
 * A variable or secret from the Worker env, falling back to the value inlined at build time
 * (CI env, `.env` in dev). Secrets Store bindings are resolved to their value.
 */
export async function workerEnv(name: keyof ImportMetaEnv): Promise<string | undefined> {
  const value: unknown = (env as unknown as Record<string, unknown>)[name]
  if (typeof value === 'string' && value) return value
  if (value && typeof (value as SecretsStoreSecret).get === 'function') {
    try {
      const secret = await (value as SecretsStoreSecret).get()
      if (secret) return secret
    } catch {
      /* missing secret: fall through */
    }
  }
  return BUILD_ENV[name] || undefined
}

/** Workers bindings (rate limiters, etc.) by name. */
export const bindings = env as unknown as Cloudflare.Env
