import type { APIRoute } from 'astro'
import { getProjects } from '../../lib/cms'

export const prerender = false

export const GET: APIRoute = async () => {
  const projects = await getProjects()
  return new Response(JSON.stringify(projects), {
    headers: { 'Content-Type': 'application/json' },
  })
}
