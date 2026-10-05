import type { APIRoute } from 'astro'
import { getFavouriteMedia, getMediaTypes } from '../../../../lib/cms'
import {
  createOgResponse,
  fetchImageAsDataUri,
  mediaItemHtml,
  notFoundResponse,
  resolveMediaCoverUrl,
  resolveMediaTypeLabel,
  resolveRating,
} from '../../../../lib/og'

export const prerender = false

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params
  if (!slug) return notFoundResponse()

  const [media, mediaTypes] = await Promise.all([getFavouriteMedia(), getMediaTypes()])

  const item = media?.find((m) => m.slug === slug)
  if (!item) return notFoundResponse()

  const coverUrl = await fetchImageAsDataUri(resolveMediaCoverUrl(item))

  const html = mediaItemHtml({
    title: item.title,
    creator: item.creator ?? '',
    rating: resolveRating(item),
    mediaType: resolveMediaTypeLabel(item, mediaTypes ?? undefined),
    coverUrl,
  })

  return createOgResponse(html)
}
