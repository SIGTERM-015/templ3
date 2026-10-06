import type { APIRoute } from 'astro'
import { cmsJsonResponse, TTL } from '../../../lib/cms'
import { getMediaDetail } from '../../../lib/magpie'
import { parseMediaKey } from '../../../lib/mediaLog'

export const prerender = false

const notFound = () =>
  new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
  })

export const GET: APIRoute = async ({ params }) => {
  const key = parseMediaKey(params.key)
  if (!key) return notFound()
  const detail = await getMediaDetail(key)
  return detail ? cmsJsonResponse(detail, TTL.LONG) : notFound()
}
