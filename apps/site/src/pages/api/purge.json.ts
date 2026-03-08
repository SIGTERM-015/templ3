import type { APIRoute } from 'astro'
import { purgeCache } from '../../lib/cms'

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  const secret = import.meta.env.PURGE_SECRET
  const auth = request.headers.get('Authorization')

  if (!secret || auth !== `Bearer ${secret}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let slugs: string[] | undefined
  try {
    const body = (await request.json()) as { slugs?: string[] }
    if (Array.isArray(body.slugs)) slugs = body.slugs
  } catch {
    /* no body is fine — purge all collections */
  }

  const purged = await purgeCache(slugs)

  return new Response(JSON.stringify({ ok: true, purged }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
