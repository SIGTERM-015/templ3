import type { APIRoute } from 'astro'
import { getLinks } from '../../lib/cms'

export const prerender = false

export const GET: APIRoute = async () => {
  const links = await getLinks()
  return new Response(JSON.stringify(links), {
    headers: { 'Content-Type': 'application/json' },
  })
}
