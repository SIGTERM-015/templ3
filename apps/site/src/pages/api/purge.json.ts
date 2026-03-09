import type { APIRoute } from 'astro'
import { purgeCache } from '../../lib/cms'

export const prerender = false

export const POST: APIRoute = async ({ request, locals }) => {
  const runtime = locals.runtime as { env?: { PURGE_SECRET?: string } } | undefined
  const secret = runtime?.env?.PURGE_SECRET || import.meta.env.PURGE_SECRET
  const auth = request.headers.get('Authorization')

  console.log('Purge request received', { 
    hasSecret: !!secret, 
    authMatch: auth === `Bearer ${secret}`,
    hasCaches: typeof caches !== 'undefined',
    hasDefault: typeof caches !== 'undefined' && typeof caches.default !== 'undefined'
  })

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
