import type { APIRoute } from 'astro'
import { getAccessToken, getNowPlaying, getRecentlyPlayed } from '../../lib/spotify'

export const prerender = false

const CACHE_TTL = 10
const CACHE_ORIGIN = 'https://spotify-cache.internal'

type CfCacheStorage = CacheStorage & { default: Cache }

function getEdgeCache(): Cache | null {
  try {
    return (caches as CfCacheStorage).default ?? null
  } catch {
    return null
  }
}

export const GET: APIRoute = async (context) => {
  const clientId = import.meta.env.SPOTIFY_CLIENT_ID || (context.locals as any)?.runtime?.env?.SPOTIFY_CLIENT_ID
  const clientSecret = import.meta.env.SPOTIFY_CLIENT_SECRET || (context.locals as any)?.runtime?.env?.SPOTIFY_CLIENT_SECRET
  const refreshToken = import.meta.env.SPOTIFY_REFRESH_TOKEN || (context.locals as any)?.runtime?.env?.SPOTIFY_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    return Response.json({ isPlaying: false, error: 'Missing Spotify credentials in env' }, { status: 500 })
  }

  const cache = getEdgeCache()
  const cacheKey = new Request(`${CACHE_ORIGIN}/now-playing`)

  if (cache) {
    const cached = await cache.match(cacheKey)
    if (cached) return cached
  }

  const accessTokenOrError = await getAccessToken(clientId, clientSecret, refreshToken)
  if (typeof accessTokenOrError === 'object' && 'error' in accessTokenOrError) {
    return Response.json({ isPlaying: false, error: accessTokenOrError.error }, { status: 500 })
  }
  
  const accessToken = accessTokenOrError as string

  const data = await getNowPlaying(accessToken) ?? await getRecentlyPlayed(accessToken) ?? { isPlaying: false }

  const response = Response.json(data, {
    headers: {
      'Cache-Control': `public, s-maxage=${CACHE_TTL}`,
      'Content-Type': 'application/json',
    },
  })

  if (cache) {
    await cache.put(cacheKey, response.clone())
  }

  return response
}
