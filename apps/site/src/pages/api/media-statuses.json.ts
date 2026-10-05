import type { APIRoute } from 'astro'
import { cmsJsonResponse, getMediaStatuses, TTL } from '../../lib/cms'

export const prerender = false

export const GET: APIRoute = async () => cmsJsonResponse(await getMediaStatuses(), TTL.LONG)
