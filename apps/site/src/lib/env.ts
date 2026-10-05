import { env } from 'cloudflare:workers'

type SecretsStoreSecret = { get(): Promise<string> }

/**
 * A runtime variable or secret from the Worker env, falling back to `import.meta.env` (vars
 * inlined at build time, `.env` in dev). Secrets Store bindings are resolved to their value.
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
  return import.meta.env[name] || undefined
}

/** Workers bindings (rate limiters, etc.) by name. */
export const bindings = env as unknown as Cloudflare.Env
