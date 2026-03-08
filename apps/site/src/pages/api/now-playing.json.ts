import type { APIRoute } from 'astro'
import { getAccessToken, getNowPlaying, getRecentlyPlayed } from '../../lib/spotify'

export const prerender = false

const CACHE_TTL = 10
const CACHE_ORIGIN = 'https://spotify-cache.internal'

type CfCacheStorage = CacheStorage & { default: Cache }

type SpotifyEnv = {
  SPOTIFY_CLIENT_ID?: string
  SPOTIFY_CLIENT_SECRET?: string
  SPOTIFY_REFRESH_TOKEN?: string
}

function getEdgeCache(): Cache | null {
  try {
    return (caches as CfCacheStorage).default ?? null
  } catch {
    return null
  }
}

export const GET: APIRoute = async ({ locals }) => {
  const env = (locals.runtime?.env ?? {}) as SpotifyEnv
  const clientId = env.SPOTIFY_CLIENT_ID ?? import.meta.env.SPOTIFY_CLIENT_ID
  const clientSecret = env.SPOTIFY_CLIENT_SECRET ?? import.meta.env.SPOTIFY_CLIENT_SECRET
  const refreshToken = env.SPOTIFY_REFRESH_TOKEN ?? import.meta.env.SPOTIFY_REFRESH_TOKEN

  if (!clientId || !clientSecret || !refreshToken) {
    return Response.json({ isPlaying: false }, { status: 200 })
  }

  const cache = getEdgeCache()
  const cacheKey = new Request(`${CACHE_ORIGIN}/now-playing`)

  if (cache) {
    const cached = await cache.match(cacheKey)
    if (cached) return cached
  }

  const accessToken = await getAccessToken(clientId, clientSecret, refreshToken)
  if (!accessToken) {
    return Response.json({ isPlaying: false }, { status: 200 })
  }

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
