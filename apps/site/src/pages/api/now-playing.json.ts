import type { APIRoute } from 'astro'
import { workerEnv } from '../../lib/env'
import { getLatestTrack } from '../../lib/lastfm'

export const prerender = false

export const GET: APIRoute = async () => {
  const [apiKey, username] = await Promise.all([
    workerEnv('LASTFM_API_KEY'),
    workerEnv('LASTFM_USERNAME'),
  ])

  const track = apiKey && username ? await getLatestTrack(apiKey.trim(), username.trim()) : null

  // Same answer for every visitor, so let the edge share it across the 30s client polls
  return new Response(JSON.stringify(track ?? { isPlaying: false }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=15, s-maxage=15',
    },
  })
}
