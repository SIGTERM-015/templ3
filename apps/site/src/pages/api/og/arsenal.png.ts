import type { APIRoute } from 'astro'
import { getSiteIdentity } from '../../../lib/cms'
import { arsenalHtml, createOgResponse, resolveSiteName } from '../../../lib/og'

export const prerender = false

export const GET: APIRoute = async () => {
  let identity = null
  try {
    identity = await getSiteIdentity()
  } catch {
    // graceful fallback
  }

  const siteName = resolveSiteName(identity)
  const html = arsenalHtml({
    title: 'ARSENAL',
    subtitle: `Projects, tooling, and weapons of choice on ${siteName}.`,
  })

  return createOgResponse(html)
}