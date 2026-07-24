import { verifyToken } from '@clerk/astro/server'
import type { APIRoute } from 'astro'
import { getGuestbookEntries } from '../../lib/cms'

export const prerender = false

const MAX_FILE_SIZE = 5 * 1024 * 1024
const PNG_SIG = [137, 80, 78, 71, 13, 10, 26, 10]
const JPEG_SIG = [0xFF, 0xD8]
const ALLOWED_ORIGINS = [
  'https://sigterm.vodka',
  'https://www.sigterm.vodka',
  'http://localhost:4321',
]

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function getSessionToken(request: Request): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7).trim()
  }

  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null

  const match = cookieHeader.match(/__session=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false
  return ALLOWED_ORIGINS.includes(origin)
}

export const GET: APIRoute = async () => {
  const entries = await getGuestbookEntries()
  return new Response(JSON.stringify(entries), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60, s-maxage=300',
    },
  })
}

/**
 * POST — submit a new guestbook entry.
 * Expects a FormData with:
 *   - image: File (PNG from Excalidraw export, or JPEG)
 *   - authorName: string
 *   - authorAvatar: string (URL)
 *   - authorDiscordId: string
 *   - message?: string
 *   - embedUrl?: string
 *
 * Authentication is verified server-side via the Clerk session token
 * (Authorization: Bearer <token> or __session cookie). The caller's
 * Origin must also match the allowed site origins.
 *
 * The entry is created with status 'pending' — it won't be visible
 * until approved in the CMS.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any)?.runtime?.env || import.meta.env
  const cmsBaseUrl = (env.PUBLIC_CMS_URL || import.meta.env.PUBLIC_CMS_URL)?.replace(/\/$/, '')
  const apiKey = env.PAYLOAD_API_KEY || import.meta.env.PAYLOAD_API_KEY || ''
  const clerkSecretKey = env.CLERK_SECRET_KEY || import.meta.env.CLERK_SECRET_KEY || ''

  if (!cmsBaseUrl) {
    return jsonResponse({ error: 'CMS not configured' }, 500)
  }

  if (!clerkSecretKey) {
    return jsonResponse({ error: 'Authentication not configured' }, 500)
  }

  const origin = request.headers.get('origin')
  if (!isAllowedOrigin(origin)) {
    return jsonResponse({ error: 'Forbidden' }, 403)
  }

  const sessionToken = getSessionToken(request)
  if (!sessionToken) {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  let clerkUserId: string
  try {
    const claims = await verifyToken(sessionToken, {
      secretKey: clerkSecretKey,
      authorizedParties: ALLOWED_ORIGINS,
    })
    clerkUserId = claims.sub
  } catch {
    return jsonResponse({ error: 'Unauthorized' }, 401)
  }

  try {
    const formData = await request.formData()
    const image = formData.get('image') as File | null
    const authorName = formData.get('authorName') as string | null
    const authorAvatar = formData.get('authorAvatar') as string | null
    const message = formData.get('message') as string | null
    const embedUrl = formData.get('embedUrl') as string | null

    if (!image || !authorName || !message) {
      return jsonResponse({ error: 'Missing required fields: image, name, or title.' }, 400)
    }

    if (image.size > MAX_FILE_SIZE) {
      return jsonResponse({ error: 'File too large (max 5MB)' }, 413)
    }

    const header = new Uint8Array(await image.slice(0, 8).arrayBuffer())
    const isPng = PNG_SIG.every((b, i) => header[i] === b)
    const isJpeg = JPEG_SIG.every((b, i) => header[i] === b)
    if (!isPng && !isJpeg) {
      return jsonResponse({ error: 'Invalid image format (PNG or JPEG required)' }, 400)
    }

    // Step 1: Upload image to CMS Media collection
    const mediaForm = new FormData()
    mediaForm.append('file', image, 'guestbook-entry.png')
    mediaForm.append('_payload', JSON.stringify({ alt: `Guestbook entry by ${authorName}` }))

    const mediaRes = await fetch(`${cmsBaseUrl}/api/media`, {
      method: 'POST',
      headers: {
        Authorization: `users API-Key ${apiKey}`,
      },
      body: mediaForm,
    })

    if (!mediaRes.ok) {
      return jsonResponse({ error: 'Failed to upload image' }, 500)
    }

    const mediaDoc = (await mediaRes.json()) as { doc: { id: string } }
    const mediaId = mediaDoc.doc.id

    // Step 2: Detect embed type from URL
    let embedType = 'none'
    if (embedUrl) {
      if (embedUrl.includes('spotify.com') || embedUrl.includes('spotify:')) {
        embedType = 'spotify'
      } else if (embedUrl.includes('youtube.com') || embedUrl.includes('youtu.be')) {
        embedType = 'youtube'
      }
    }

    // Step 3: Create guestbook entry
    const entryRes = await fetch(`${cmsBaseUrl}/api/guestbook-entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `users API-Key ${apiKey}`,
      },
      body: JSON.stringify({
        authorName,
        authorAvatar: authorAvatar || undefined,
        clerkUserId,
        image: mediaId,
        message: message || undefined,
        embedUrl: embedUrl || undefined,
        embedType,
        status: 'pending',
      }),
    })

    if (!entryRes.ok) {
      return jsonResponse({ error: 'Failed to create entry' }, 500)
    }

    const entry = await entryRes.json()
    return jsonResponse({ success: true, entry }, 201)
  } catch {
    return jsonResponse({ error: 'Internal server error' }, 500)
  }
}
