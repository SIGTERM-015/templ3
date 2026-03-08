import type { CollectionAfterChangeHook } from 'payload'

const SITE_URL = process.env.SITE_URL?.replace(/\/$/, '')
const PURGE_SECRET = process.env.PURGE_SECRET

export function createPurgeHook(options?: { sendSlugs?: boolean }): CollectionAfterChangeHook {
  return async ({ doc, req }) => {
    if (!SITE_URL || !PURGE_SECRET) return doc

    const body: Record<string, unknown> = {}
    if (options?.sendSlugs && doc?.slug) {
      body.slugs = [doc.slug]
    }

    try {
      const res = fetch(`${SITE_URL}/api/purge.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PURGE_SECRET}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (req.context?.waitUntil) {
        (req.context.waitUntil as (p: Promise<unknown>) => void)(res)
      }
    } catch {
      req.payload.logger.warn('Cache purge failed')
    }

    return doc
  }
}
