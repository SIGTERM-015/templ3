import type { APIRoute } from 'astro'
import { getFavouriteMedia } from '../../lib/cms'

export const prerender = false

export const GET: APIRoute = async () => {
  const media = await getFavouriteMedia()
  return new Response(JSON.stringify(media), {
    headers: { 'Content-Type': 'application/json' },
  })
}
