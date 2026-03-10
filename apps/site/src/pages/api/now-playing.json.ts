import type { APIRoute } from 'astro'
import { getAccessToken, getNowPlaying, getRecentlyPlayed } from '../../lib/spotify'

export const prerender = false

export const GET: APIRoute = async (context) => {
  const env = (context.locals as any)?.runtime?.env || {}
  
  const resolveSecret = async (binding: any): Promise<string | undefined> => {
    if (!binding) return undefined
    if (typeof binding === 'string') return binding
    if (typeof binding.get === 'function') {
      try {
        return await binding.get()
      } catch {
        // Secrets Store bindings are unavailable in local dev — fall through to import.meta.env
        return undefined
      }
    }
    return String(binding)
  }

  const clientIdPromise = resolveSecret(env.SPOTIFY_CLIENT_ID).then(v => v || import.meta.env.SPOTIFY_CLIENT_ID)
  const clientSecretPromise = resolveSecret(env.SPOTIFY_CLIENT_SECRET).then(v => v || import.meta.env.SPOTIFY_CLIENT_SECRET)
  const refreshTokenPromise = resolveSecret(env.SPOTIFY_REFRESH_TOKEN).then(v => v || import.meta.env.SPOTIFY_REFRESH_TOKEN)

  const [rawClientId, rawClientSecret, rawRefreshToken] = await Promise.all([
    clientIdPromise,
    clientSecretPromise,
    refreshTokenPromise
  ])

  const clientId = String(rawClientId || '').trim()
  const clientSecret = String(rawClientSecret || '').trim()
  const refreshToken = String(rawRefreshToken || '').trim()

  if (!clientId || !clientSecret || !refreshToken) {
    return Response.json({ 
      isPlaying: false, 
      error: 'Missing Spotify credentials in env',
      debug: {
        hasClientIdMeta: !!import.meta.env.SPOTIFY_CLIENT_ID,
        hasClientIdLocals: !!env.SPOTIFY_CLIENT_ID,
        hasSecretMeta: !!import.meta.env.SPOTIFY_CLIENT_SECRET,
        hasSecretLocals: !!env.SPOTIFY_CLIENT_SECRET,
      }
    }, { status: 500 })
  }

  const accessTokenOrError = await getAccessToken(clientId, clientSecret, refreshToken)
  if (typeof accessTokenOrError === 'object' && 'error' in accessTokenOrError) {
    return Response.json({ 
      isPlaying: false, 
      error: accessTokenOrError.error,
      debug: {
        clientIdLength: String(clientId).length,
        clientSecretLength: String(clientSecret).length,
        refreshTokenLength: String(refreshToken).length,
        clientIdType: typeof clientId,
        clientIdPrefix: String(clientId).substring(0, 16),
        clientIdJson: JSON.stringify(clientId)
      }
    }, { status: 500 })
  }
  
  const accessToken = accessTokenOrError as string

  const data = await getNowPlaying(accessToken) ?? await getRecentlyPlayed(accessToken) ?? { isPlaying: false }

  return Response.json(data, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
