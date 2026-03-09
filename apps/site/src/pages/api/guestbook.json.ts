import type { APIRoute } from 'astro'
import { getGuestbookEntries } from '../../lib/cms'

export const prerender = false

export const GET: APIRoute = async () => {
  const entries = await getGuestbookEntries()
  return new Response(JSON.stringify(entries), {
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * POST — submit a new guestbook entry.
 * Expects a FormData with:
 *   - image: File (PNG from Excalidraw export)
 *   - authorName: string
 *   - authorAvatar: string (URL)
 *   - authorDiscordId: string
 *   - clerkUserId: string
 *   - message?: string
 *   - embedUrl?: string
 *
 * The entry is created with status 'pending' — it won't be visible
 * until approved in the CMS.
 */
export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any)?.runtime?.env || import.meta.env
  const cmsBaseUrl = (env.PUBLIC_CMS_URL || import.meta.env.PUBLIC_CMS_URL)?.replace(/\/$/, '')
  const apiKey = env.PAYLOAD_API_KEY || import.meta.env.PAYLOAD_API_KEY || ''
  
  if (!cmsBaseUrl) {
    return new Response(JSON.stringify({ error: 'CMS not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const formData = await request.formData()
    const image = formData.get('image') as File | null
    const authorName = formData.get('authorName') as string | null
    const authorAvatar = formData.get('authorAvatar') as string | null
    const authorDiscordId = formData.get('authorDiscordId') as string | null
    const clerkUserId = formData.get('clerkUserId') as string | null
    const message = formData.get('message') as string | null
    const embedUrl = formData.get('embedUrl') as string | null

    if (!image || !authorName || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields: image, name, or title.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
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
      const err = await mediaRes.text()
      return new Response(JSON.stringify({ 
        error: 'Failed to upload image', 
        details: err,
        debug: `Key exists: ${!!apiKey}, URL: ${cmsBaseUrl}` 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
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
        authorDiscordId: authorDiscordId || undefined,
        clerkUserId: clerkUserId || undefined,
        image: mediaId,
        message: message || undefined,
        embedUrl: embedUrl || undefined,
        embedType,
        status: 'pending',
      }),
    })

    if (!entryRes.ok) {
      const err = await entryRes.text()
      return new Response(JSON.stringify({ error: 'Failed to create entry', details: err }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const entry = await entryRes.json()
    return new Response(JSON.stringify({ success: true, entry }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
