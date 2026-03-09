import type { MediaLookupProvider, MediaLookupResult } from './types'

const ANILIST_API = 'https://graphql.anilist.co'

const SEARCH_QUERY = `
query ($search: String, $type: MediaType) {
  Page(perPage: 10) {
    media(search: $search, type: $type, sort: POPULARITY_DESC) {
      id
      title {
        romaji
        english
        native
      }
      coverImage {
        large
      }
      startDate {
        year
      }
      description(asHtml: false)
      studios(isMain: true) {
        nodes {
          name
        }
      }
      staff(sort: RELEVANCE, perPage: 1) {
        nodes {
          name {
            full
          }
        }
      }
      siteUrl
    }
  }
}
`

async function searchAniList(
  query: string,
  type: 'ANIME' | 'MANGA',
): Promise<MediaLookupResult[]> {
  const response = await fetch(ANILIST_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query: SEARCH_QUERY,
      variables: { search: query, type },
    }),
  })

  if (!response.ok) {
    console.error('AniList API error:', response.status)
    return []
  }

  const json = (await response.json()) as {
    data?: {
      Page?: {
        media?: Array<{
          id: number
          title: { romaji?: string; english?: string; native?: string }
          coverImage?: { large?: string }
          startDate?: { year?: number }
          description?: string
          studios?: { nodes?: Array<{ name: string }> }
          staff?: { nodes?: Array<{ name: { full: string } }> }
          siteUrl?: string
        }>
      }
    }
  }

  const results = json.data?.Page?.media ?? []

  return results.map((item) => {
    // For anime, use studio; for manga, use first staff member (usually author)
    const creator =
      type === 'ANIME'
        ? item.studios?.nodes?.[0]?.name
        : item.staff?.nodes?.[0]?.name?.full

    return {
      externalId: String(item.id),
      source: type === 'ANIME' ? 'anilist-anime' : 'anilist-manga',
      title: item.title.english || item.title.romaji || item.title.native || '',
      creator,
      coverUrl: item.coverImage?.large,
      externalUrl: item.siteUrl,
      year: item.startDate?.year,
      description: item.description?.replace(/<[^>]*>/g, '').slice(0, 200),
    }
  })
}

export const anilistAnimeProvider: MediaLookupProvider = {
  search: (query) => searchAniList(query, 'ANIME'),
}

export const anilistMangaProvider: MediaLookupProvider = {
  search: (query) => searchAniList(query, 'MANGA'),
}
