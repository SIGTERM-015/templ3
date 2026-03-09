import type { MediaLookupProvider, MediaLookupResult } from './types'

const TMDB_API_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

type TmdbMultiResult = {
  id: number
  media_type: 'movie' | 'tv' | 'person'
  title?: string // movies
  name?: string // tv shows
  poster_path?: string | null
  release_date?: string // movies
  first_air_date?: string // tv
  overview?: string
}

type TmdbMovieCredits = {
  crew?: Array<{ job: string; name: string }>
}

type TmdbTvDetails = {
  created_by?: Array<{ name: string }>
}

async function getMovieDirector(movieId: number, apiKey: string): Promise<string | undefined> {
  try {
    const res = await fetch(`${TMDB_API_BASE}/movie/${movieId}/credits?api_key=${apiKey}`)
    if (!res.ok) return undefined
    const data = (await res.json()) as TmdbMovieCredits
    const director = data.crew?.find((c) => c.job === 'Director')
    return director?.name
  } catch {
    return undefined
  }
}

async function getTvCreator(tvId: number, apiKey: string): Promise<string | undefined> {
  try {
    const res = await fetch(`${TMDB_API_BASE}/tv/${tvId}?api_key=${apiKey}`)
    if (!res.ok) return undefined
    const data = (await res.json()) as TmdbTvDetails
    return data.created_by?.[0]?.name
  } catch {
    return undefined
  }
}

export function createTmdbProvider(apiKey: string): MediaLookupProvider {
  return {
    async search(query: string): Promise<MediaLookupResult[]> {
      if (!apiKey) {
        console.error('TMDB API key not configured')
        return []
      }

      const url = `${TMDB_API_BASE}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false`

      try {
        const res = await fetch(url)
        if (!res.ok) {
          console.error('TMDB API error:', res.status)
          return []
        }

        const data = (await res.json()) as { results?: TmdbMultiResult[] }
        const results = data.results ?? []

        // Filter to only movies and TV, limit to 10
        const filtered = results
          .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
          .slice(0, 10)

        // Fetch creator info in parallel
        const withCreators = await Promise.all(
          filtered.map(async (item) => {
            let creator: string | undefined
            if (item.media_type === 'movie') {
              creator = await getMovieDirector(item.id, apiKey)
            } else if (item.media_type === 'tv') {
              creator = await getTvCreator(item.id, apiKey)
            }

            const title = item.title || item.name || ''
            const dateStr = item.release_date || item.first_air_date
            const year = dateStr ? parseInt(dateStr.slice(0, 4), 10) : undefined

            return {
              externalId: String(item.id),
              source: 'tmdb' as const,
              title,
              creator,
              coverUrl: item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : undefined,
              externalUrl: `https://www.themoviedb.org/${item.media_type}/${item.id}`,
              year: isNaN(year as number) ? undefined : year,
              description: item.overview?.slice(0, 200),
            }
          }),
        )

        return withCreators
      } catch (err) {
        console.error('TMDB search error:', err)
        return []
      }
    },
  }
}
