import type { APIRoute } from 'astro'
import { cmsJsonResponse, getSiteIdentity, TTL } from '../../lib/cms'

export const prerender = false

export const GET: APIRoute = async () => cmsJsonResponse(await getSiteIdentity(), TTL.LONG)
