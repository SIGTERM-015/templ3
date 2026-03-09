import type { MediaLookupProvider, MediaLookupResult } from './types'

const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token'
const IGDB_API_URL = 'https://api.igdb.com/v4/games'

// Cache the access token with expiry
let cachedToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(clientId: string, clientSecret: string): Promise<string | null> {
  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 300000) {
    return cachedToken.token
  }

  try {
    const res = await fetch(TWITCH_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      }),
    })

    if (!res.ok) {
      console.error('Twitch OAuth error:', res.status)
      return null
    }

    const data = (await res.json()) as { access_token: string; expires_in: number }
    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    }

    return cachedToken.token
  } catch (err) {
    console.error('Twitch OAuth error:', err)
    return null
  }
}

type IgdbGame = {
  id: number
  name: string
  cover?: { url?: string }
  first_release_date?: number
  summary?: string
  involved_companies?: Array<{
    developer?: boolean
    company?: { name?: string }
  }>
  url?: string
}

export function createIgdbProvider(clientId: string, clientSecret: string): MediaLookupProvider {
  return {
    async search(query: string): Promise<MediaLookupResult[]> {
      if (!clientId || !clientSecret) {
        console.error('IGDB credentials not configured')
        return []
      }

      const token = await getAccessToken(clientId, clientSecret)
      if (!token) return []

      try {
        const res = await fetch(IGDB_API_URL, {
          method: 'POST',
          headers: {
            'Client-ID': clientId,
            Authorization: `Bearer ${token}`,
            'Content-Type': 'text/plain',
          },
          body: `
            search "${query.replace(/"/g, '\\"')}";
            fields name, cover.url, first_release_date, summary, involved_companies.developer, involved_companies.company.name, url;
            limit 10;
          `,
        })

        if (!res.ok) {
          console.error('IGDB API error:', res.status)
          return []
        }

        const games = (await res.json()) as IgdbGame[]

        return games.map((game) => {
          // Find developer company
          const developer = game.involved_companies?.find((ic) => ic.developer)?.company?.name

          // Convert cover URL to larger size
          // IGDB returns: //images.igdb.com/igdb/image/upload/t_thumb/xxx.jpg
          // We want: https://images.igdb.com/igdb/image/upload/t_cover_big/xxx.jpg
          let coverUrl: string | undefined
          if (game.cover?.url) {
            coverUrl = game.cover.url
              .replace('t_thumb', 't_cover_big')
              .replace('//', 'https://')
          }

          // Convert Unix timestamp to year
          const year = game.first_release_date
            ? new Date(game.first_release_date * 1000).getFullYear()
            : undefined

          return {
            externalId: String(game.id),
            source: 'igdb' as const,
            title: game.name,
            creator: developer,
            coverUrl,
            externalUrl: game.url,
            year,
            description: game.summary?.slice(0, 200),
          }
        })
      } catch (err) {
        console.error('IGDB search error:', err)
        return []
      }
    },
  }
}
