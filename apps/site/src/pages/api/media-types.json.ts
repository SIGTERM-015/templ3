import type { APIRoute } from 'astro'
import { cmsJsonResponse, getMediaTypes, TTL } from '../../lib/cms'

export const prerender = false

export const GET: APIRoute = async () => cmsJsonResponse(await getMediaTypes(), TTL.LONG)
