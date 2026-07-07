import type { APIRoute } from 'astro'
import { getPostBySlug } from '../../../../lib/cms'
import {
  blogPostHtml,
  createOgResponse,
  formatDate,
  notFoundResponse,
  resolvePostCoverUrl,
} from '../../../../lib/og'

export const prerender = false

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params
  if (!slug) return notFoundResponse()

  let post = null
  try {
    post = await getPostBySlug(slug)
  } catch {
    // graceful fallback
  }

  if (!post) return notFoundResponse()

  const html = blogPostHtml({
    title: post.title,
    dateLabel: formatDate(post.publishedAt),
    coverUrl: resolvePostCoverUrl(post),
  })

  return createOgResponse(html)
}