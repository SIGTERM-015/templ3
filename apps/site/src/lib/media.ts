import type { CmsMedia } from './cms'

// Browser-safe CMS helpers. lib/cms.ts reads Worker secrets via cloudflare:workers, so only
// server code (pages, API routes) may import its values; client components use this module.

/** Resolve a CmsMedia relationship to its URL */
export function mediaUrl(value: CmsMedia | string | null | undefined): string | undefined {
  if (!value) return undefined
  if (typeof value === 'string') return undefined
  return value.url ?? undefined
}

/**
 * Returns a proxied/cached URL for a CMS media file.
 * Routes through /api/img/ for Cloudflare edge caching (30 days)
 * and optional image resizing via Cloudflare Images (free: 5k/month).
 * @param width - Optional width in px. Serves WebP/AVIF automatically.
 */
export function cachedMediaUrl(
  value: CmsMedia | string | null | undefined,
  width?: number,
): string | undefined {
  const url = mediaUrl(value)
  if (!url) return undefined

  // Extract the filename from the CMS URL
  // URL format: https://cms.sigterm.vodka/api/media/file/filename.png
  try {
    const parsed = new URL(url)
    const match = parsed.pathname.match(/\/api\/media\/file\/(.+)$/)
    if (!match) return url // Fallback to direct URL if pattern doesn't match

    const filename = match[1]
    const params = width ? `?w=${width}` : ''
    const encoded = encodeURIComponent(decodeURIComponent(filename))
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/'/g, '%27')
    return `/api/img/${encoded}${params}`
  } catch {
    return url
  }
}

/** Resolve a populated relationship's value field (e.g. CmsProjectStatus) */
export function resolveValue<T extends { value: string }>(
  rel: T | string | null | undefined,
): string | undefined {
  if (!rel) return undefined
  if (typeof rel === 'string') return rel
  return rel.value
}
