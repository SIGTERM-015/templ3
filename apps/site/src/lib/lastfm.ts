export type NowPlayingTrack = {
  isPlaying: boolean
  title: string
  artist: string
  album: string
  albumArt: string
  songUrl: string
}

type LastfmTrack = {
  name: string
  artist: { '#text': string }
  album: { '#text': string }
  image: Array<{ size: string; '#text': string }>
  url: string
  '@attr'?: { nowplaying?: string }
}

/**
 * Most recent scrobble for `username`. Last.fm puts the currently playing track first
 * (flagged `nowplaying`), so one call answers both "what's playing" and "last played".
 */
export async function getLatestTrack(
  apiKey: string,
  username: string,
): Promise<NowPlayingTrack | null> {
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(username)}&api_key=${encodeURIComponent(apiKey)}&format=json&limit=1`

  try {
    const res = await fetch(url, {
      cf: { cacheTtl: 15 },
    } as RequestInit)

    if (!res.ok) return null

    const data = await res.json() as { recenttracks?: { track?: LastfmTrack[] } }
    const track = data.recenttracks?.track?.[0]
    if (!track) return null

    return {
      isPlaying: track['@attr']?.nowplaying === 'true',
      title: track.name,
      artist: track.artist['#text'] || '',
      album: track.album['#text'] || '',
      albumArt: track.image?.[3]?.['#text'] || track.image?.[2]?.['#text'] || '',
      songUrl: track.url,
    }
  } catch {
    return null
  }
}
