import type { APIRoute } from 'astro'
import { cmsJsonResponse, getPostBySlug, TTL } from '../../../lib/cms'

export const prerender = false

export const GET: APIRoute = async ({ params }) => {
  const post = params.slug ? await getPostBySlug(params.slug) : null
  if (!post) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=60' },
    })
  }
  return cmsJsonResponse(post, TTL.STANDARD)
}
