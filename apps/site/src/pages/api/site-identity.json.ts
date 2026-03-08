import type { APIRoute } from 'astro'
import { getSiteIdentity } from '../../lib/cms'

export const prerender = false

export const GET: APIRoute = async () => {
  const identity = await getSiteIdentity()
  return new Response(JSON.stringify(identity ?? {}), {
    headers: { 'Content-Type': 'application/json' },
  })
}
