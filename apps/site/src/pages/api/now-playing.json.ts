import type { APIRoute } from 'astro'
import { getLatestTrack } from '../../lib/lastfm'

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

  const track = apiKey && username ? await getLatestTrack(apiKey, username) : null

  // Same answer for every visitor, so let the edge share it across the 30s client polls
  return new Response(JSON.stringify(track ?? { isPlaying: false }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=15, s-maxage=15',
    },
  })
}
