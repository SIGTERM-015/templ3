import type { APIRoute } from 'astro'
import { getSiteIdentity } from '../../../lib/cms'
import {
  createOgResponse,
  dossierHtml,
  resolveSiteDescription,
  resolveSiteName,
} from '../../../lib/og'

export const prerender = false

export const GET: APIRoute = async () => {
  let identity = null
  try {
    identity = await getSiteIdentity()
  } catch {
    // graceful fallback — use siteConfig defaults
  }

  const html = dossierHtml({
    siteName: resolveSiteName(identity),
    description: resolveSiteDescription(identity),
  })

  return createOgResponse(html)
}