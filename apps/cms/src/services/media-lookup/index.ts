import type { LookupSource, MediaLookupResult } from './types'
import { anilistAnimeProvider, anilistMangaProvider } from './anilist'
import { createIgdbProvider } from './igdb'
import { createTmdbProvider } from './tmdb'
import { openLibraryProvider } from './openlibrary'
import { musicBrainzProvider } from './musicbrainz'

export type { LookupSource, MediaLookupResult } from './types'

/**
 * Search for media using the appropriate provider based on source
 */
export async function searchMedia(
  source: LookupSource,
  query: string,
): Promise<MediaLookupResult[]> {
  if (!query.trim()) return []

  switch (source) {
    case 'anilist-anime':
      return anilistAnimeProvider.search(query)

    case 'anilist-manga':
      return anilistMangaProvider.search(query)

    case 'igdb': {
      const clientId = process.env.TWITCH_CLIENT_ID || ''
      const clientSecret = process.env.TWITCH_CLIENT_SECRET || ''
      const provider = createIgdbProvider(clientId, clientSecret)
      return provider.search(query)
    }

    case 'tmdb': {
      const apiKey = process.env.TMDB_API_KEY || ''
      const provider = createTmdbProvider(apiKey)
      return provider.search(query)
    }

    case 'openlibrary':
      return openLibraryProvider.search(query)

    case 'musicbrainz':
      return musicBrainzProvider.search(query)

    case 'none':
    default:
      return []
  }
}

/**
 * Get a human-readable label for a lookup source
 */
export function getLookupSourceLabel(source: LookupSource): string {
  const labels: Record<LookupSource, string> = {
    none: 'Manual Entry',
    igdb: 'IGDB (Games)',
    tmdb: 'TMDB (Movies & TV)',
    'anilist-anime': 'AniList (Anime)',
    'anilist-manga': 'AniList (Manga)',
    openlibrary: 'Open Library (Books)',
    musicbrainz: 'MusicBrainz (Music)',
  }
  return labels[source] || source
}
