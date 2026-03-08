import type { APIRoute } from 'astro'
import { getMediaStatuses } from '../../lib/cms'

export const prerender = false

export const GET: APIRoute = async () => {
  const statuses = await getMediaStatuses()
  return new Response(JSON.stringify(statuses), {
    headers: { 'Content-Type': 'application/json' },
  })
}
