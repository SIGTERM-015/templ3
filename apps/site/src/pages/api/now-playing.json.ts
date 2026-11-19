import type { APIRoute } from 'astro'
import { cachedJson } from '../../lib/edgeCache'
import { workerEnv } from '../../lib/env'
import { getLatestTrack } from '../../lib/listenbrainz'

export const prerender = false

const CACHE_TTL = 15

export const GET: APIRoute = async () => {
  const [rawUsername, rawToken] = await Promise.all([
    workerEnv('LISTENBRAINZ_USERNAME'),
    workerEnv('LISTENBRAINZ_TOKEN'),
  ])

  const username = rawUsername?.trim()
  const token = rawToken?.trim() || undefined

  const track = username
    ? await cachedJson(`listenbrainz:${username}`, CACHE_TTL, () => getLatestTrack(username, token))
    : null

  // Same answer for every visitor, so let the edge share it across the 30s client polls
  return new Response(JSON.stringify(track ?? { isPlaying: false }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${CACHE_TTL}, s-maxage=${CACHE_TTL}`,
    },
  })
}
