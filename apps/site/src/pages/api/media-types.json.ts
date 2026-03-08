import type { APIRoute } from 'astro'
import { getMediaTypes } from '../../lib/cms'

export const prerender = false

export const GET: APIRoute = async () => {
  const types = await getMediaTypes()
  return new Response(JSON.stringify(types), {
    headers: { 'Content-Type': 'application/json' },
  })
}
