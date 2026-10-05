import type { APIRoute } from 'astro'
import { cmsJsonResponse, getPosts, TTL } from '../../lib/cms'

export const prerender = false

export const GET: APIRoute = async () => cmsJsonResponse(await getPosts(), TTL.SHORT)
