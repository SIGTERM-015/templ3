/**
 * Unified media lookup result type returned by all providers
 */
export type MediaLookupResult = {
  /** External ID from the source API */
  externalId: string
  /** Source identifier (igdb, tmdb, anilist-anime, etc.) */
  source: string
  /** Title of the media */
  title: string
  /** Creator - author, artist, studio, developer, etc. */
  creator?: string
  /** Cover image URL */
  coverUrl?: string
  /** URL to the item on the external site */
  externalUrl?: string
  /** Release year */
  year?: number
  /** Short description or summary */
  description?: string
}

export type LookupSource =
  | 'none'
  | 'igdb'
  | 'tmdb'
  | 'anilist-anime'
  | 'anilist-manga'
  | 'openlibrary'
  | 'musicbrainz'

export type MediaLookupProvider = {
  search: (query: string) => Promise<MediaLookupResult[]>
}
