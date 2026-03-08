import type { APIRoute } from 'astro'
import { getProjectStatuses } from '../../lib/cms'

export const prerender = false

export const GET: APIRoute = async () => {
  const statuses = await getProjectStatuses()
  return new Response(JSON.stringify(statuses), {
    headers: { 'Content-Type': 'application/json' },
  })
}
