import { ImageResponse } from 'workers-og'

import type { CmsFavMedia, CmsMediaType, CmsPost, CmsSiteIdentity } from './cms'
import { mediaUrl } from './cms'
import { site } from '../data/siteConfig'
import logoSvgRaw from '../../public/sigterm-logo.svg?raw'

// ─── Constants ──────────────────────────────────────────────────────────────

const OG_WIDTH = 1200
const OG_HEIGHT = 630
const CACHE_CONTROL = 'public, max-age=3600, s-maxage=86400'

const GRID_SVG =
  "<svg width='40' height='40' xmlns='http://www.w3.org/2000/svg'>" +
  "<path d='M0 0h40v40H0z' fill='none'/>" +
  "<path d='M0 39.5h40M39.5 0v40' stroke='rgba(255,184,0,0.1)' stroke-width='1'/>" +
  '</svg>'

const GRID_BG = `url('data:image/svg+xml;base64,${btoa(GRID_SVG)}')`

const LOGO_PATH_D = logoSvgRaw.match(/<path[^>]*\sd="([^"]+)"/)?.[1] ?? ''

function logoDataUri(color: string): string {
  try {
    if (!LOGO_PATH_D) return ''
    const svg =
      `<svg width="1024" height="1024" viewBox="0 0 1024 1024" ` +
      `xmlns="http://www.w3.org/2000/svg"><path d="${LOGO_PATH_D}" ` +
      `fill="${color}" stroke="${color}" /></svg>`
    return `data:image/svg+xml;base64,${btoa(svg)}`
  } catch {
    return ''
  }
}

const FONT_URL =
  'https://cdn.jsdelivr.net/fontsource/fonts/monaspace-neon@latest/latin-400-normal.ttf'

// ─── Font caching (per-isolate) ─────────────────────────────────────────────

let fontData: ArrayBuffer | null = null
let fontDataPromise: Promise<ArrayBuffer | null> | null = null
let ogRenderQueue: Promise<void> = Promise.resolve()

async function loadOgFont(): Promise<ArrayBuffer | null> {
  if (fontData) return fontData
  if (fontDataPromise) return fontDataPromise

  fontDataPromise = fetchOgFont()
  const data = await fontDataPromise
  if (!data) fontDataPromise = null
  return data
}

async function fetchOgFont(): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(FONT_URL)
    if (!res.ok) return null
    fontData = await res.arrayBuffer()
    return fontData
  } catch {
    return null
  }
}

async function renderOgResponse(html: string, font: ArrayBuffer): Promise<Uint8Array> {
  const render = async () => {
    const response = new ImageResponse(html, {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      fonts: [
        {
          name: 'Monaspace Neon',
          data: font,
          weight: 400,
          style: 'normal',
        },
      ],
    })

    return new Uint8Array(await response.arrayBuffer())
  }

  const previousRender = ogRenderQueue
  let releaseRender: () => void = () => {}
  ogRenderQueue = new Promise<void>((resolve) => {
    releaseRender = resolve
  })

  try {
    await previousRender
    return await render()
  } finally {
    releaseRender()
  }
}

// ─── Image pre-fetch ─────────────────────────────────────────────────────────

const MAX_IMAGE_BYTES = 4 * 1024 * 1024 // 4 MB
const FETCH_TIMEOUT_MS = 5_000

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 8192
  let binary = ''
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  return btoa(binary)
}

export async function fetchImageAsDataUri(
  url: string | undefined,
): Promise<string | undefined> {
  if (!url) return undefined
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; Templ3Bot/1.0; +https://sigterm.vodka)',
        Accept: 'image/*',
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    if (!res.ok) return undefined

    const contentLength = res.headers.get('content-length')
    if (contentLength && parseInt(contentLength, 10) > MAX_IMAGE_BYTES) {
      return undefined
    }

    const buf = await res.arrayBuffer()
    if (buf.byteLength === 0 || buf.byteLength > MAX_IMAGE_BYTES) {
      return undefined
    }

    const mime = res.headers.get('content-type')?.split(';')[0]?.trim() || 'image/jpeg'
    return `data:${mime};base64,${arrayBufferToBase64(buf)}`
  } catch {
    return undefined
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function escapeText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeAttribute(text: string): string {
  return escapeText(text).replace(/"/g, '&quot;')
}

function formatDate(iso: string | undefined): string {
  if (!iso) return ''
  try {
    const date = new Date(iso)
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ]
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  } catch {
    return ''
  }
}

const cmsBaseUrl = import.meta.env.PUBLIC_CMS_URL?.replace(/\/$/, '')

function absoluteUrl(url: string | undefined): string | undefined {
  if (!url) return undefined
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (!cmsBaseUrl) return undefined
  return `${cmsBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`
}

function resolveMediaLabel(rel: CmsMediaType | string | null | undefined): string {
  if (!rel) return ''
  if (typeof rel === 'string') return rel
  return rel.label || rel.value || ''
}

// ─── Logo element ────────────────────────────────────────────────────────────

type LogoOpts = {
  width: number
  height: number
  opacity: number
  invert?: boolean
}

function logoDiv(opts: LogoOpts): string {
  const logo = logoDataUri(opts.invert ? '#ffffff' : '#ff00ff')
  const image = logo
    ? `<img src="${logo}" width="${opts.width}" height="${opts.height}" ` +
      `style="width: ${opts.width}px; height: ${opts.height}px; object-fit: contain;" />`
    : ''
  return (
    `<div style="display: flex; position: absolute; bottom: 60px; right: 60px; ` +
    `width: ${opts.width}px; height: ${opts.height}px; z-index: 20; ` +
    `opacity: ${opts.opacity};">${image}</div>`
  )
}

// ─── Design: Dossier (home) ──────────────────────────────────────────────────

export function dossierHtml(opts: {
  siteName: string
  description: string
}): string {
  return (
    `<div style="display: flex; flex-direction: column; width: 1200px; height: 630px; ` +
    `background-color: #0d0d0d; background-image: ${GRID_BG}; color: #ffb800; ` +
    `position: relative;">` +
    `<div style="display: flex; width: 24px; height: 100%; background-color: #ff00ff; ` +
    `position: absolute; top: 0; left: 0;"></div>` +
    `<div style="display: flex; flex-direction: column; justify-content: center; ` +
    `width: 100%; height: 100%; padding: 60px 60px 60px 100px;">` +
    `<span style="font-size: 24px; color: #ff00ff; margin-bottom: 10px;">` +
    `// OPERATOR PROFILE</span>` +
    `<h1 style="font-size: 110px; margin: 0; letter-spacing: -4px; line-height: 1;">` +
    `${escapeText(opts.siteName)}</h1>` +
    `<p style="font-size: 32px; color: #888; margin-top: 30px; ` +
    `max-width: 800px; line-height: 1.4;">${escapeText(opts.description)}</p>` +
    `</div>` +
    logoDiv({ width: 120, height: 120, opacity: 0.25 }) +
    `</div>`
  )
}

// ─── Design: Arsenal ────────────────────────────────────────────────────────

export function arsenalHtml(opts: {
  title: string
  subtitle: string
}): string {
  return (
    `<div style="display: flex; flex-direction: column; width: 1200px; height: 630px; ` +
    `background-color: #0d0d0d; background-image: ${GRID_BG}; color: #ffb800; ` +
    `position: relative;">` +
    `<div style="display: flex; width: 24px; height: 100%; background-color: #00ffcc; ` +
    `position: absolute; top: 0; left: 0;"></div>` +
    `<div style="display: flex; flex-direction: column; justify-content: center; ` +
    `width: 100%; height: 100%; padding: 60px 60px 60px 100px;">` +
    `<h1 style="font-size: 90px; margin: 0; letter-spacing: -2px; ` +
    `color: #00ffcc;">${escapeText(opts.title)}</h1>` +
    `<p style="font-size: 30px; color: #888; margin-top: 20px;">` +
    `${escapeText(opts.subtitle)}</p>` +
    `<div style="display: flex; gap: 20px; margin-top: 50px;">` +
    `<div style="display: flex; padding: 15px 30px; border: 2px solid #333; color: #fff; ` +
    `font-size: 24px;">Hardware</div>` +
    `<div style="display: flex; padding: 15px 30px; border: 2px solid #333; color: #fff; ` +
    `font-size: 24px;">Software</div>` +
    `<div style="display: flex; padding: 15px 30px; border: 2px solid #333; color: #fff; ` +
    `font-size: 24px;">Services</div>` +
    `</div>` +
    `</div>` +
    logoDiv({ width: 120, height: 120, opacity: 0.25 }) +
    `</div>`
  )
}

// ─── Design: Media section ──────────────────────────────────────────────────

export function mediaHtml(opts: {
  title: string
  subtitle: string
}): string {
  return (
    `<div style="display: flex; flex-direction: column; width: 1200px; height: 630px; ` +
    `background-color: #0d0d0d; background-image: ${GRID_BG}; color: #ffb800; ` +
    `position: relative;">` +
    `<div style="display: flex; width: 24px; height: 100%; background-color: #ffb800; ` +
    `position: absolute; top: 0; left: 0;"></div>` +
    `<div style="display: flex; flex-direction: row; justify-content: space-between; ` +
    `align-items: center; width: 100%; height: 100%; padding: 60px 60px 60px 100px;">` +
    `<div style="display: flex; flex-direction: column; max-width: 600px;">` +
    `<h1 style="font-size: 90px; margin: 0; letter-spacing: -2px; ` +
    `color: #ffb800;">${escapeText(opts.title)}</h1>` +
    `<p style="font-size: 30px; color: #888; margin-top: 20px;">` +
    `${escapeText(opts.subtitle)}</p>` +
    `</div>` +
    `<div style="display: flex; flex-wrap: wrap; width: 400px; gap: 20px;">` +
    `<div style="display: flex; width: 180px; height: 250px; background-color: #222; ` +
    `border: 1px solid #444;"></div>` +
    `<div style="display: flex; width: 180px; height: 250px; background-color: #222; ` +
    `border: 1px solid #444; transform: translateY(40px);"></div>` +
    `</div>` +
    `</div>` +
    logoDiv({ width: 80, height: 80, opacity: 0.25 }) +
    `</div>`
  )
}

// ─── Design: Blog post ───────────────────────────────────────────────────────

export function blogPostHtml(opts: {
  title: string
  dateLabel: string
  coverUrl?: string
}): string {
  const coverBg = opts.coverUrl
    ? `<div style="display: flex; position: absolute; width: 100%; height: 100%; ` +
      `background-image: url('${escapeAttribute(opts.coverUrl)}'); background-size: cover; ` +
      `background-position: center;"></div>` +
      `<div style="display: flex; position: absolute; width: 100%; height: 100%; ` +
      `background-color: rgba(10,10,10,0.85);"></div>`
    : `<div style="display: flex; position: absolute; width: 100%; height: 100%; ` +
      `background-color: #0d0d0d; background-image: ${GRID_BG};"></div>`

  return (
    `<div style="display: flex; width: 1200px; height: 630px; position: relative;">` +
    coverBg +
    `<div style="display: flex; width: 24px; height: 100%; background-color: #ff00ff; ` +
    `position: absolute; top: 0; left: 0;"></div>` +
    `<div style="display: flex; flex-direction: column; justify-content: center; ` +
    `padding: 80px; width: 100%; height: 100%; position: absolute; top: 0; left: 0;">` +
    `<span style="display: flex; align-items: center; font-size: 24px; ` +
    `color: #ff00ff; margin-bottom: 20px;">` +
    `<span style="width: 40px; height: 2px; background-color: #ff00ff; ` +
    `margin-right: 15px;"></span>` +
    `<span>ARTICLE</span></span>` +
    `<h1 style="font-size: 75px; color: #ffffff; margin: 0; ` +
    `text-shadow: 4px 4px 0px #ff00ff; max-width: 1000px; line-height: 1.1;">` +
    `${escapeText(opts.title)}</h1>` +
    (opts.dateLabel
      ? `<span style="font-size: 24px; color: #aaa; margin-top: 40px;">` +
        `Published on ${escapeText(opts.dateLabel)}</span>`
      : '') +
    `</div>` +
    logoDiv({ width: 80, height: 80, opacity: 0.5, invert: true }) +
    `</div>`
  )
}

// ─── Design: Media item ──────────────────────────────────────────────────────

export function mediaItemHtml(opts: {
  title: string
  creator: string
  rating?: string
  mediaType: string
  coverUrl?: string
}): string {
  const hasCover = !!opts.coverUrl
  const coverColumn = hasCover
    ? `<div style="display: flex; flex-direction: column; justify-content: center; ` +
      `width: 400px;">` +
      `<div style="display: flex; width: 400px; height: 560px; overflow: hidden; ` +
      `background-color: #222; border: 1px solid #444;">` +
      `<img src="${escapeAttribute(opts.coverUrl!)}" width="400" height="560" ` +
      `style="width: 400px; height: 560px; object-fit: cover; object-position: center;" />` +
      `</div></div>`
    : ''
  const ratingHtml = opts.rating
    ? `<span style="font-size: 36px; color: #ffb800; font-weight: 700;">` +
      `${escapeText(opts.rating)}</span>`
    : ''
  const mediaTypeHtml = opts.mediaType
    ? `<span style="font-size: 24px; color: #888; padding: 8px 20px; ` +
      `border: 2px solid #444;">${escapeText(opts.mediaType.toUpperCase())}</span>`
    : ''
  const metaHtml = ratingHtml || mediaTypeHtml
    ? `<div style="display: flex; gap: 20px; margin-top: 30px;">` +
      ratingHtml +
      mediaTypeHtml +
      `</div>`
    : ''
  const textMaxWidth = hasCover ? '600px' : '1000px'

  return (
    `<div style="display: flex; flex-direction: row; width: 1200px; height: 630px; ` +
    `background-color: #0d0d0d; background-image: ${GRID_BG}; color: #ffb800; ` +
    `position: relative;">` +
    `<div style="display: flex; width: 24px; height: 100%; background-color: #ffb800; ` +
    `position: absolute; top: 0; left: 0;"></div>` +
    `<div style="display: flex; flex-direction: row; justify-content: space-between; ` +
    `align-items: center; width: 100%; height: 100%; padding: 35px 60px 35px 100px;">` +
    `<div style="display: flex; flex-direction: column; justify-content: center; ` +
    `flex: 1; max-width: ${textMaxWidth};">` +
    `<span style="font-size: 24px; color: #ffb800; margin-bottom: 10px;">` +
    `// MEDIA</span>` +
    `<h1 style="font-size: 70px; margin: 0; color: #ffb800; line-height: 1.1;">` +
    `${escapeText(opts.title)}</h1>` +
    (opts.creator
      ? `<span style="font-size: 28px; color: #888; margin-top: 20px;">` +
        `${escapeText(opts.creator)}</span>`
      : '') +
    metaHtml +
    `</div>` +
    coverColumn +
    `</div>` +
    logoDiv({ width: 80, height: 80, opacity: 0.25 }) +
    `</div>`
  )
}

// ─── Response helpers ────────────────────────────────────────────────────────

export async function createOgResponse(html: string): Promise<Response> {
  const font = await loadOgFont()
  if (!font) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/sigterm-logo.svg', 'Cache-Control': 'no-store' },
    })
  }

  try {
    const image = await renderOgResponse(html, font)
    return new Response(image, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': CACHE_CONTROL,
      },
    })
  } catch {
    return new Response('Open Graph image generation failed', {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-store',
      },
    })
  }
}

export function notFoundResponse(): Response {
  return new Response('Not found', {
    status: 404,
    headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'no-store' },
  })
}

// ─── Data resolution helpers ─────────────────────────────────────────────────

export function resolveSiteName(identity: CmsSiteIdentity | null): string {
  return identity?.siteName ?? site.name
}

export function resolveSiteDescription(identity: CmsSiteIdentity | null): string {
  return identity?.siteDescription ?? site.description
}

export function resolvePostCoverUrl(post: CmsPost): string | undefined {
  const url = mediaUrl(post.heroImage)
  return absoluteUrl(url)
}

export function resolveMediaCoverUrl(item: CmsFavMedia): string | undefined {
  const cover = mediaUrl(item.coverImage)
  if (cover) return absoluteUrl(cover)
  if (item.externalCoverUrl) return item.externalCoverUrl
  return undefined
}

export function resolveMediaTypeLabel(item: CmsFavMedia, mediaTypes: CmsMediaType[] = []): string {
  const label = resolveMediaLabel(item.mediaType)
  if (label && !/^\d+$/.test(label)) return label

  const mediaTypeId = typeof item.mediaType === 'number' || typeof item.mediaType === 'string'
    ? String(item.mediaType)
    : undefined
  const mediaType = mediaTypes.find((type) => String(type.id) === mediaTypeId)
  if (mediaType) return mediaType.label || mediaType.value || ''

  const externalSource = 'externalSource' in item && typeof item.externalSource === 'string'
    ? item.externalSource
    : ''
  if (externalSource.includes('anime')) return 'Anime'
  if (externalSource.includes('manga')) return 'Manga'
  if (externalSource.includes('movie')) return 'Movie'
  if (externalSource.includes('tv')) return 'TV'
  if (externalSource.includes('game')) return 'Game'

  return label
}

export function resolveRating(item: CmsFavMedia): string | undefined {
  if (item.rating == null) return undefined
  return `${item.rating}/10`
}

export { formatDate }
