import type { APIRoute } from 'astro'
import { getNowPlaying, getRecentTracks } from '../../lib/lastfm'

export const prerender = false

async function resolveSecret(binding: unknown): Promise<string | undefined> {
  if (!binding) return undefined
  if (typeof binding === 'string') return binding
  if (typeof binding === 'object' && binding !== null && 'get' in binding && typeof (binding as { get: Function }).get === 'function') {
    try {
      return await (binding as { get: () => Promise<string> }).get()
    } catch {
      return undefined
    }
  }
  return String(binding)
}

export const GET: APIRoute = async (context) => {
  const env = ((context.locals as unknown as { runtime?: { env?: Record<string, unknown> } }).runtime)?.env ?? {}

  const [rawApiKey, rawUsername] = await Promise.all([
    resolveSecret(env.LASTFM_API_KEY).then(v => v || import.meta.env.LASTFM_API_KEY),
    resolveSecret(env.LASTFM_USERNAME).then(v => v || import.meta.env.LASTFM_USERNAME),
  ])

  const apiKey = String(rawApiKey || '').trim()
  const username = String(rawUsername || '').trim()

  if (!apiKey || !username) {
    return new Response(JSON.stringify({ isPlaying: false }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=25',
      },
    })
  }

  const nowPlaying = await getNowPlaying(apiKey, username)

  if (nowPlaying?.isPlaying) {
    return new Response(JSON.stringify(nowPlaying), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=25',
      },
    })
  }

  // Not currently playing — return most recent track
  const recent = await getRecentTracks(apiKey, username, 1)
  const lastTrack = recent[0]

  return new Response(JSON.stringify(lastTrack ?? { isPlaying: false }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'private, max-age=25',
    },
  })
}
