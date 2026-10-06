import { waitUntil } from 'cloudflare:workers'

// Upstream reads (CMS, Magpie) send an Authorization header, and Cloudflare never caches
// authenticated subrequests, so `cf.cacheTtl` on those fetches was a no-op. This caches the
// parsed result in the colo's Cache API instead, under a key that carries no credentials.
const CACHE_ORIGIN = 'https://edge-cache.internal'

/**
 * Returns `load()`'s result, served from the edge cache for `ttl` seconds after the first
 * success. `null` means the upstream was unavailable and is never cached, so an outage
 * ends as soon as the upstream recovers.
 */
export async function cachedJson<T>(
  key: string,
  ttl: number,
  load: () => Promise<T | null>,
): Promise<T | null> {
  const cache = typeof caches !== 'undefined' ? (caches as unknown as { default?: Cache }).default : undefined
  if (!cache) return load()

  const request = new Request(`${CACHE_ORIGIN}/${encodeURIComponent(key)}`)
  try {
    const hit = await cache.match(request)
    if (hit) return (await hit.json()) as T
  } catch {
    /* unreadable entry: refetch */
  }

  const value = await load()
  if (value !== null) {
    const response = new Response(JSON.stringify(value), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': `public, max-age=${ttl}` },
    })
    const put = cache.put(request, response).catch(() => {})
    try {
      waitUntil(put)
    } catch {
      await put
    }
  }
  return value
}
