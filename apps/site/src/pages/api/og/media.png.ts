import type { APIRoute } from 'astro'
import { getSiteIdentity } from '../../../lib/cms'
import { createOgResponse, mediaHtml, resolveSiteName } from '../../../lib/og'

export const prerender = false

export const GET: APIRoute = async () => {
  let identity = null
  try {
    identity = await getSiteIdentity()
  } catch {
    // graceful fallback
  }

  const html = mediaHtml({
    title: 'MEDIA',
    subtitle: `Anime, games, books, movies — everything on ${resolveSiteName(identity)}.`,
  })

  return createOgResponse(html)
}