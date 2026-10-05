import type { APIRoute } from 'astro'
import { cmsJsonResponse, getProjects, TTL } from '../../lib/cms'

export const prerender = false

export const GET: APIRoute = async () => cmsJsonResponse(await getProjects(), TTL.STANDARD)
