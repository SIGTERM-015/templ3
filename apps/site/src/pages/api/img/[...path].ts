import type { APIRoute } from 'astro'

export const prerender = false

const CMS_BASE_FALLBACK = 'https://cms.sigterm.vodka'
const ALLOWED_WIDTHS = [150, 300, 600, 1200]
const CACHE_TTL = 60 * 60 * 24 * 30 // 30 days — images are immutable once uploaded
const FALLBACK_CACHE_TTL = 60 * 60 // 1 hour for non-transformed fallback

/**
 * Safely forwards a response from the origin, filtering headers and handling
 * status codes that do not allow a body (204, 304).
 */
const forwardErrorResponse = (res: Response) => {
  const isNoBody = [204, 304].includes(res.status)
  const headers = new Headers()

  // Explicit allowlist: only propagate essential safety/content headers
  const contentType = res.headers.get('Content-Type')
  if (contentType) headers.set('Content-Type', contentType)

  const retryAfter = res.headers.get('Retry-After')
  if (retryAfter) headers.set('Retry-After', retryAfter)

  // Use a fixed TTL for error/fallback responses to avoid inheriting origin cache policy
  headers.set('Cache-Control', `public, max-age=${FALLBACK_CACHE_TTL}`)

  return new Response(isNoBody ? null : res.body, {
    status: res.status,
    headers,
  })
}

export const GET: APIRoute = async ({ params, request, locals }) => {
  const path = params.path
  if (!path) {
    return new Response('Not found', { status: 404 })
  }

  // Get env from Cloudflare runtime or import.meta.env
  const runtime = locals.runtime
  const env = runtime?.env || import.meta.env
  const cmsBase = (env.PUBLIC_CMS_URL || CMS_BASE_FALLBACK).replace(/\/$/, '')

  const url = new URL(request.url)
  const rawWidth = url.searchParams.get('w')

  let width: number | undefined
  if (rawWidth) {
    const parsedWidth = parseInt(rawWidth, 10)
    if (!isNaN(parsedWidth) && parsedWidth > 0) {
      // Round up to the nearest allowed width, or cap at the largest
      width =
        ALLOWED_WIDTHS.find((w) => w >= parsedWidth) || ALLOWED_WIDTHS[ALLOWED_WIDTHS.length - 1]
    }
  }

  const originUrl = `${cmsBase}/api/media/file/${encodeURIComponent(path)}`

  try {
    // 1. Try with transformation if width is valid
    if (width) {
      const transformRes = await fetch(originUrl, {
        headers: {
          // Point 1: Negotiate format via Accept header
          Accept: request.headers.get('Accept') || '*/*',
        },
        cf: {
          // Point 3: Only cache 2xx statuses for long TTL
          cacheTtlByStatus: {
            '200-299': CACHE_TTL,
            '404': 1,
            '500-599': 0,
          },
          cacheEverything: true,
          image: {
            width,
            quality: 80,
            format: 'auto' as const,
            fit: 'scale-down' as const,
          },
        },
        // Cast necessary: global RequestInit type lacks Cloudflare 'cf' property
      } as unknown as RequestInit)

      if (transformRes.ok) {
        const isNoBody = [204, 304].includes(transformRes.status)
        return new Response(isNoBody ? null : transformRes.body, {
          status: transformRes.status,
          headers: {
            'Content-Type': transformRes.headers.get('Content-Type') || 'image/png',
            'Cache-Control': `public, max-age=${CACHE_TTL}, immutable`,
            'CDN-Cache-Control': `public, max-age=${CACHE_TTL}`,
            // Point 1: Must vary by Accept for auto-format negotiation
            Vary: 'Accept',
          },
        })
      }

      // Point 4: Limit fallback to actual transformation failures via Cf-Resized
      const resizeError = transformRes.headers.get('Cf-Resized')?.startsWith('err=')
      if (!resizeError) {
        // Origin error (404, 403, 5xx) - propagate it directly
        return forwardErrorResponse(transformRes)
      }

      // If it IS a resizing error, proceed to fallback below
    }

    // 2. Fetch original (either no width requested, or transformation failed)
    const originalRes = await fetch(originUrl, {
      cf: {
        cacheTtlByStatus: {
          '200-299': CACHE_TTL,
          '404': 1,
          '500-599': 0,
        },
        cacheEverything: true,
      },
      // Cast necessary: global RequestInit type lacks Cloudflare 'cf' property
    } as unknown as RequestInit)

    if (!originalRes.ok) {
      // Point 4: Propagate real status from origin instead of hardcoded 404
      return forwardErrorResponse(originalRes)
    }

    // Point 2: Distinguish healthy path (no width) from fallback path (failed transform)
    const isFallback = !!width
    const ttl = isFallback ? FALLBACK_CACHE_TTL : CACHE_TTL

    const isNoBody = [204, 304].includes(originalRes.status)
    return new Response(isNoBody ? null : originalRes.body, {
      status: originalRes.status,
      headers: {
        'Content-Type': originalRes.headers.get('Content-Type') || 'image/png',
        'Cache-Control': `public, max-age=${ttl}${isFallback ? '' : ', immutable'}`,
        'CDN-Cache-Control': `public, max-age=${ttl}`,
      },
    })
  } catch {
    return new Response('Error fetching image', { status: 502 })
  }
}
