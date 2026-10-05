import type { APIRoute } from 'astro'
import { cmsJsonResponse, getLinks, TTL } from '../../lib/cms'

export const prerender = false

export const GET: APIRoute = async () => cmsJsonResponse(await getLinks(), TTL.LONG)
