import type { APIRoute } from 'astro'

export const prerender = false

const CMS_BASE = 'https://cms.sigterm.vodka'
const CACHE_TTL = 60 * 60 * 24 * 30 // 30 days — images are immutable once uploaded

export const GET: APIRoute = async ({ params, request }) => {
  const path = params.path
  if (!path) {
    return new Response('Not found', { status: 404 })
  }

  const url = new URL(request.url)
  const width = url.searchParams.get('w')

  const originUrl = `${CMS_BASE}/api/media/file/${encodeURIComponent(path)}`

  // Cloudflare Images Transformations (free tier: 5,000 unique/month)
  // Serves WebP/AVIF automatically based on Accept header
  const imageOpts = width
    ? { image: { width: parseInt(width, 10), quality: 80, format: 'auto' as const, fit: 'scale-down' as const } }
    : {}

  try {
    const res = await fetch(originUrl, {
      cf: {
        cacheTtl: CACHE_TTL,
        cacheEverything: true,
        ...imageOpts,
      },
    } as RequestInit)

    if (!res.ok) {
      return new Response('Not found', { status: 404 })
    }

    return new Response(res.body, {
      status: 200,
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'image/png',
        'Cache-Control': `public, max-age=${CACHE_TTL}, immutable`,
        'CDN-Cache-Control': `public, max-age=${CACHE_TTL}`,
      },
    })
  } catch {
    return new Response('Error fetching image', { status: 502 })
  }
}
