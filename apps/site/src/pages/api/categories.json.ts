import type { APIRoute } from 'astro'
import { cmsJsonResponse, getCategories, TTL } from '../../lib/cms'

export const prerender = false

export const GET: APIRoute = async () => cmsJsonResponse(await getCategories(), TTL.LONG)
