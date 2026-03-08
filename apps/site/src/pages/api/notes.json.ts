import type { APIRoute } from 'astro'
import { getNotes } from '../../lib/cms'

export const prerender = false

export const GET: APIRoute = async () => {
  const notes = await getNotes()
  return new Response(JSON.stringify(notes), {
    headers: { 'Content-Type': 'application/json' },
  })
}
