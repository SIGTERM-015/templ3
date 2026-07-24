import type { APIRoute } from 'astro'
import { getPosts } from '../../lib/cms'

export const prerender = false

export const GET: APIRoute = async () => {
  const posts = await getPosts()
  return new Response(JSON.stringify(posts), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300, s-maxage=3600',
    },
  })
}
