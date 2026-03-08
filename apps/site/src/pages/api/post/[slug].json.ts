import type { APIRoute } from 'astro'
import { getPostBySlug } from '../../../lib/cms'

export const prerender = false

export const GET: APIRoute = async ({ params }) => {
  const post = params.slug ? await getPostBySlug(params.slug) : null
  if (!post) {
    return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
  }
  return new Response(JSON.stringify(post), {
    headers: { 'Content-Type': 'application/json' },
  })
}
