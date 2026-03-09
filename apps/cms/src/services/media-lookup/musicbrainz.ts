import type { MediaLookupProvider, MediaLookupResult } from './types'

const MUSICBRAINZ_API = 'https://musicbrainz.org/ws/2/release'
const COVER_ART_ARCHIVE = 'https://coverartarchive.org/release'

// MusicBrainz requires a descriptive User-Agent
const USER_AGENT = 'Templ3CMS/1.0 (https://sigterm.vodka)'

type MusicBrainzRelease = {
  id: string
  title: string
  date?: string
  'artist-credit'?: Array<{
    name: string
    artist?: { name: string }
  }>
}

export const musicBrainzProvider: MediaLookupProvider = {
  async search(query: string): Promise<MediaLookupResult[]> {
    try {
      const url = `${MUSICBRAINZ_API}?query=${encodeURIComponent(query)}&fmt=json&limit=10`

      const res = await fetch(url, {
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/json',
        },
      })

      if (!res.ok) {
        console.error('MusicBrainz API error:', res.status)
        return []
      }

      const data = (await res.json()) as { releases?: MusicBrainzRelease[] }
      const releases = data.releases ?? []

      return releases.map((release) => {
        // Get artist name from artist-credit
        const artist = release['artist-credit']?.[0]?.name

        // Extract year from date (format: YYYY or YYYY-MM-DD)
        const year = release.date ? parseInt(release.date.slice(0, 4), 10) : undefined

        return {
          externalId: release.id,
          source: 'musicbrainz' as const,
          title: release.title,
          creator: artist,
          // Cover Art Archive - may not exist for all releases
          // Using front-500 for medium size cover
          coverUrl: `${COVER_ART_ARCHIVE}/${release.id}/front-500`,
          externalUrl: `https://musicbrainz.org/release/${release.id}`,
          year: isNaN(year as number) ? undefined : year,
        }
      })
    } catch (err) {
      console.error('MusicBrainz search error:', err)
      return []
    }
  },
}
