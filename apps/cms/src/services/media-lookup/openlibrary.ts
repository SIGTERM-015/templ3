import type { MediaLookupProvider, MediaLookupResult } from './types'

const OPEN_LIBRARY_API = 'https://openlibrary.org/search.json'

type OpenLibraryDoc = {
  key: string // e.g. "/works/OL45883W"
  title: string
  author_name?: string[]
  cover_i?: number
  first_publish_year?: number
}

export const openLibraryProvider: MediaLookupProvider = {
  async search(query: string): Promise<MediaLookupResult[]> {
    try {
      const url = `${OPEN_LIBRARY_API}?q=${encodeURIComponent(query)}&limit=10&fields=key,title,author_name,cover_i,first_publish_year`

      const res = await fetch(url)
      if (!res.ok) {
        console.error('Open Library API error:', res.status)
        return []
      }

      const data = (await res.json()) as { docs?: OpenLibraryDoc[] }
      const docs = data.docs ?? []

      return docs.map((doc) => ({
        externalId: doc.key.replace('/works/', ''),
        source: 'openlibrary' as const,
        title: doc.title,
        creator: doc.author_name?.[0],
        coverUrl: doc.cover_i
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
          : undefined,
        externalUrl: `https://openlibrary.org${doc.key}`,
        year: doc.first_publish_year,
      }))
    } catch (err) {
      console.error('Open Library search error:', err)
      return []
    }
  },
}
