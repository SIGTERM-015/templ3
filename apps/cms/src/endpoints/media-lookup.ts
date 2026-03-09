import type { Endpoint } from 'payload'
import { searchMedia } from '../services/media-lookup'
import type { LookupSource } from '../services/media-lookup'

const VALID_SOURCES: LookupSource[] = [
  'igdb',
  'tmdb',
  'anilist-anime',
  'anilist-manga',
  'openlibrary',
  'musicbrainz',
]

export const mediaLookupEndpoint: Endpoint = {
  path: '/media-lookup',
  method: 'get',
  handler: async (req) => {
    // Require authentication
    if (!req.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url || '', 'http://localhost')
    const source = url.searchParams.get('source') as LookupSource | null
    const query = url.searchParams.get('q')

    if (!source || !VALID_SOURCES.includes(source)) {
      return Response.json(
        { error: `Invalid source. Valid sources: ${VALID_SOURCES.join(', ')}` },
        { status: 400 },
      )
    }

    if (!query || query.trim().length < 2) {
      return Response.json(
        { error: 'Query must be at least 2 characters' },
        { status: 400 },
      )
    }

    try {
      const results = await searchMedia(source, query.trim())
      return Response.json({ results })
    } catch (err) {
      req.payload.logger.error({ err, source, query }, 'Media lookup error')
      return Response.json({ error: 'Search failed' }, { status: 500 })
    }
  },
}
