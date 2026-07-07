import type { APIRoute } from 'astro'
import { getFavouriteMedia, getMediaTypes } from '../../../../lib/cms'
import {
  createOgResponse,
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

  let media: Awaited<ReturnType<typeof getFavouriteMedia>> = []
  let mediaTypes: Awaited<ReturnType<typeof getMediaTypes>> = []
  try {
    const cmsData = await Promise.all([getFavouriteMedia(), getMediaTypes()])
    media = cmsData[0]
    mediaTypes = cmsData[1]
  } catch {
    // graceful fallback
  }

  const item = media.find((m) => m.slug === slug)
  if (!item) return notFoundResponse()

  const html = mediaItemHtml({
    title: item.title,
    creator: item.creator ?? '',
    rating: resolveRating(item),
    mediaType: resolveMediaTypeLabel(item, mediaTypes),
    coverUrl: resolveMediaCoverUrl(item),
  })

  return createOgResponse(html)
}
