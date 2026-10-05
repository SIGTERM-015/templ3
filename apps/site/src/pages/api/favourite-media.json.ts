import type { APIRoute } from 'astro'
import { cmsJsonResponse, getFavouriteMedia, TTL } from '../../lib/cms'

export const prerender = false

export const GET: APIRoute = async () => cmsJsonResponse(await getFavouriteMedia(), TTL.STANDARD)
