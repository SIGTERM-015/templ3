import type { APIRoute } from 'astro'
import { cmsJsonResponse, getProjectStatuses, TTL } from '../../lib/cms'

export const prerender = false

export const GET: APIRoute = async () => cmsJsonResponse(await getProjectStatuses(), TTL.LONG)
