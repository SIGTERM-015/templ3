import type { APIRoute } from 'astro'
import { getPosts } from '../../lib/cms'

export const prerender = false

export const GET: APIRoute = async () => {
  const posts = await getPosts()
  return new Response(JSON.stringify(posts), {
    headers: { 'Content-Type': 'application/json' },
  })
}
