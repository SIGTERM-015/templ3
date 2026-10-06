import type { APIRoute } from 'astro'
import { cmsJsonResponse, TTL } from '../../lib/cms'
import { getMediaLog } from '../../lib/magpie'

export const prerender = false

export const GET: APIRoute = async () => cmsJsonResponse(await getMediaLog(), TTL.STANDARD)
