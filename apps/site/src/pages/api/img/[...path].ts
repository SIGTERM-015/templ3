import type { APIRoute } from 'astro'

export const prerender = false

const CMS_BASE = 'https://cms.sigterm.vodka'
const CACHE_TTL = 60 * 60 * 24 * 30 // 30 days — images are immutable once uploaded

export const GET: APIRoute = async ({ params }) => {
  const path = params.path
  if (!path) {
    return new Response('Not found', { status: 404 })
  }

  const originUrl = `${CMS_BASE}/api/media/file/${encodeURIComponent(path)}`

  try {
    const res = await fetch(originUrl, {
      cf: {
        cacheTtl: CACHE_TTL,
        cacheEverything: true,
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
