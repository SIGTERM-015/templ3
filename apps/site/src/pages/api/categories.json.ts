import type { APIRoute } from 'astro'
import { getCategories } from '../../lib/cms'

export const prerender = false

export const GET: APIRoute = async () => {
  const categories = await getCategories()
  return new Response(JSON.stringify(categories), {
    headers: { 'Content-Type': 'application/json' },
  })
}
