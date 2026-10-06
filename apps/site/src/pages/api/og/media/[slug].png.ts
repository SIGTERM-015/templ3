import type { APIRoute } from 'astro'
import { getMediaDetail } from '../../../../lib/magpie'
import { parseMediaKey, TYPE_LABELS } from '../../../../lib/mediaLog'
import {
  createOgResponse,
  fetchImageAsDataUri,
  mediaItemHtml,
  notFoundResponse,
} from '../../../../lib/og'

export const prerender = false

export const GET: APIRoute = async ({ params }) => {
  const key = parseMediaKey(params.slug)
  const item = key ? await getMediaDetail(key) : null
  if (!item) return notFoundResponse()

  const html = mediaItemHtml({
    title: item.title,
    creator: [item.creators[0], item.year].filter(Boolean).join(' · '),
    rating: item.score != null ? `${item.score}/10` : undefined,
    mediaType: TYPE_LABELS[item.type],
    coverUrl: await fetchImageAsDataUri(item.cover),
  })

  return createOgResponse(html)
}
