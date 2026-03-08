const TOKEN_URL = 'https://accounts.spotify.com/api/token'
const NOW_PLAYING_URL = 'https://api.spotify.com/v1/me/player/currently-playing'
const RECENTLY_PLAYED_URL = 'https://api.spotify.com/v1/me/player/recently-played?limit=1'

export type SpotifyTrack = {
  isPlaying: boolean
  title: string
  artist: string
  album: string
  albumArt: string
  songUrl: string
  progressMs: number
  durationMs: number
}

export type SpotifyResponse =
  | SpotifyTrack
  | { isPlaying: false }

export async function getAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string,
): Promise<string | null> {
  const basic = btoa(`${clientId}:${clientSecret}`)

  try {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })

    if (!res.ok) return null

    const data = (await res.json()) as { access_token: string }
    return data.access_token
  } catch {
    return null
  }
}

type SpotifyTrackItem = {
  name: string
  artists: { name: string }[]
  album: { name: string; images: { url: string }[] }
  external_urls: { spotify: string }
  duration_ms: number
}

function toTrack(item: SpotifyTrackItem, isPlaying: boolean, progressMs = 0): SpotifyTrack {
  return {
    isPlaying,
    title: item.name,
    artist: item.artists.map((a) => a.name).join(', '),
    album: item.album.name,
    albumArt: item.album.images[0]?.url ?? '',
    songUrl: item.external_urls.spotify,
    progressMs,
    durationMs: item.duration_ms,
  }
}

export async function getNowPlaying(
  accessToken: string,
): Promise<SpotifyTrack | null> {
  try {
    const res = await fetch(NOW_PLAYING_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (res.status === 204 || res.status > 400) return null

    const data = await res.json() as {
      is_playing: boolean
      item?: SpotifyTrackItem
      progress_ms: number
    }

    if (!data.item) return null
    return toTrack(data.item, data.is_playing, data.progress_ms)
  } catch {
    return null
  }
}

export async function getRecentlyPlayed(
  accessToken: string,
): Promise<SpotifyTrack | null> {
  try {
    const res = await fetch(RECENTLY_PLAYED_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!res.ok) return null

    const data = await res.json() as {
      items?: { track: SpotifyTrackItem }[]
    }

    const item = data.items?.[0]?.track
    if (!item) return null
    return toTrack(item, false)
  } catch {
    return null
  }
}
