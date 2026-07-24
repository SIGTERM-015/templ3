export type NowPlayingTrack = {
  isPlaying: boolean
  title: string
  artist: string
  album: string
  albumArt: string
  songUrl: string
}

let cachedToken: null = null // No token caching needed for Last.fm (API key only)

export async function getNowPlaying(
  apiKey: string,
  username: string,
): Promise<NowPlayingTrack | null> {
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(username)}&api_key=${encodeURIComponent(apiKey)}&format=json&limit=1`

  try {
    const res = await fetch(url, {
      cf: { cacheTtl: 15 },
    } as RequestInit)

    if (!res.ok) return null

    const data = await res.json() as {
      recenttracks?: {
        track?: Array<{
          name: string
          artist: { '#text': string }
          album: { '#text': string }
          image: Array<{ size: string; '#text': string }>
          url: string
          '@attr'?: { nowplaying?: string }
        }>
      }
    }

    const track = data.recenttracks?.track?.[0]
    if (!track) return null

    const isPlaying = track['@attr']?.nowplaying === 'true'
    const albumArt = track.image?.[3]?.['#text'] || track.image?.[2]?.['#text'] || ''

    return {
      isPlaying,
      title: track.name,
      artist: track.artist['#text'] || '',
      album: track.album['#text'] || '',
      albumArt,
      songUrl: track.url,
    }
  } catch {
    return null
  }
}

export async function getRecentTracks(
  apiKey: string,
  username: string,
  limit = 5,
): Promise<NowPlayingTrack[]> {
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(username)}&api_key=${encodeURIComponent(apiKey)}&format=json&limit=${limit}`

  try {
    const res = await fetch(url, {
      cf: { cacheTtl: 60 },
    } as RequestInit)

    if (!res.ok) return []

    const data = await res.json() as {
      recenttracks?: {
        track?: Array<{
          name: string
          artist: { '#text': string }
          album: { '#text': string }
          image: Array<{ size: string; '#text': string }>
          url: string
          '@attr'?: { nowplaying?: string }
        }>
      }
    }

    return (data.recenttracks?.track ?? []).map(t => ({
      isPlaying: t['@attr']?.nowplaying === 'true',
      title: t.name,
      artist: t.artist['#text'] || '',
      album: t.album['#text'] || '',
      albumArt: t.image?.[3]?.['#text'] || t.image?.[2]?.['#text'] || '',
      songUrl: t.url,
    }))
  } catch {
    return []
  }
}
