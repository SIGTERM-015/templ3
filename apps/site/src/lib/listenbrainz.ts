import { site } from '../data/siteConfig'

// Server-only: reads the ListenBrainz public API (and optionally /1/metadata/lookup/ when a
// user token is configured). Client components should import only `type NowPlayingTrack`.

const API_BASE = 'https://api.listenbrainz.org'
const USER_AGENT = `templ3-site/1.0 (+https://${site.domain})`
const MAX_LOOKUP_QUERY_LENGTH = 250

export type NowPlayingTrack = {
  isPlaying: boolean
  title: string
  artist: string
  album: string
  albumArt: string
  songUrl: string
}

type JsonRecord = Record<string, unknown>

type ParsedListen = {
  title: string
  artist: string
  album: string
  originUrl: string
  recordingMbid: string
  caaReleaseMbid: string
  caaId: number | null
}

type LookupMetadata = {
  recordingMbid: string
  caaReleaseMbid: string
  caaId: number | null
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function asPositiveNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null
}

function isHttpUrl(value: string): boolean {
  if (!value) return false
  try {
    const { protocol } = new URL(value)
    return protocol === 'https:' || protocol === 'http:'
  } catch {
    return false
  }
}

function buildHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'User-Agent': USER_AGENT,
  }
  if (token) headers.Authorization = `Token ${token}`
  return headers
}

async function fetchJson(url: string, headers: Record<string, string>): Promise<unknown> {
  try {
    const res = await fetch(url, { headers })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

function parseFirstListen(data: unknown): ParsedListen | null {
  if (!isRecord(data) || !isRecord(data.payload) || !Array.isArray(data.payload.listens)) {
    return null
  }
  const first = data.payload.listens[0]
  if (!isRecord(first) || !isRecord(first.track_metadata)) return null

  const meta = first.track_metadata
  const title = asString(meta.track_name)
  if (!title) return null

  const artist = asString(meta.artist_name)
  const album = asString(meta.release_name)
  const additionalInfo = isRecord(meta.additional_info) ? meta.additional_info : null
  const mbidMapping = isRecord(meta.mbid_mapping) ? meta.mbid_mapping : null

  return {
    title,
    artist,
    album,
    originUrl: additionalInfo ? asString(additionalInfo.origin_url) : '',
    recordingMbid:
      (mbidMapping ? asString(mbidMapping.recording_mbid) : '') ||
      (additionalInfo ? asString(additionalInfo.recording_mbid) : ''),
    caaReleaseMbid: mbidMapping ? asString(mbidMapping.caa_release_mbid) : '',
    caaId: mbidMapping ? asPositiveNumber(mbidMapping.caa_id) : null,
  }
}

function sameTrack(a: ParsedListen, b: ParsedListen): boolean {
  return (
    a.artist.toLowerCase() === b.artist.toLowerCase() &&
    a.title.toLowerCase() === b.title.toLowerCase()
  )
}

function coverArtUrl(caaReleaseMbid: string, caaId: number | null): string {
  if (!caaReleaseMbid || caaId === null) return ''
  return `https://coverartarchive.org/release/${encodeURIComponent(caaReleaseMbid)}/${caaId}-250.jpg`
}

async function lookupMetadata(
  listen: ParsedListen,
  headers: Record<string, string>,
): Promise<LookupMetadata | null> {
  if (!listen.artist || !listen.title) return null
  if (listen.artist.length + listen.title.length > MAX_LOOKUP_QUERY_LENGTH) return null

  const params = new URLSearchParams({
    artist_name: listen.artist,
    recording_name: listen.title,
    metadata: 'true',
    inc: 'release',
  })
  if (
    listen.album &&
    listen.artist.length + listen.title.length + listen.album.length <= MAX_LOOKUP_QUERY_LENGTH
  ) {
    params.set('release_name', listen.album)
  }

  const data = await fetchJson(`${API_BASE}/1/metadata/lookup/?${params.toString()}`, headers)
  if (!isRecord(data)) return null

  const release = isRecord(data.metadata) && isRecord(data.metadata.release)
    ? data.metadata.release
    : null

  return {
    recordingMbid: asString(data.recording_mbid),
    caaReleaseMbid: asString(release?.caa_release_mbid) || asString(data.caa_release_mbid),
    caaId: asPositiveNumber(release?.caa_id) ?? asPositiveNumber(data.caa_id),
  }
}

/**
 * Currently playing track or most recent listen for `username` on ListenBrainz.
 * Never throws; returns `null` when the user has no listens or ListenBrainz is unreachable.
 */
export async function getLatestTrack(
  username: string,
  token?: string,
): Promise<NowPlayingTrack | null> {
  const user = username.trim()
  if (!user) return null

  const encodedUser = encodeURIComponent(user)
  const headers = buildHeaders(token?.trim() || undefined)

  const [playingNowRaw, listensRaw] = await Promise.all([
    fetchJson(`${API_BASE}/1/user/${encodedUser}/playing-now`, headers),
    fetchJson(`${API_BASE}/1/user/${encodedUser}/listens?count=1`, headers),
  ])

  const playingNow = parseFirstListen(playingNowRaw)
  const latestListen = parseFirstListen(listensRaw)
  const isPlaying = playingNow !== null
  const listen = playingNow ?? latestListen
  if (!listen) return null

  let recordingMbid = listen.recordingMbid
  let caaReleaseMbid = listen.caaReleaseMbid
  let caaId = listen.caaId

  if (isPlaying) {
    if (latestListen && sameTrack(listen, latestListen)) {
      recordingMbid ||= latestListen.recordingMbid
      caaReleaseMbid = latestListen.caaReleaseMbid
      caaId = latestListen.caaId
    } else if (headers.Authorization) {
      const lookup = await lookupMetadata(listen, headers)
      if (lookup) {
        recordingMbid ||= lookup.recordingMbid
        caaReleaseMbid = lookup.caaReleaseMbid
        caaId = lookup.caaId
      }
    }
  }

  const songUrl = isHttpUrl(listen.originUrl)
    ? listen.originUrl
    : recordingMbid
      ? `https://musicbrainz.org/recording/${encodeURIComponent(recordingMbid)}`
      : `https://listenbrainz.org/user/${encodedUser}/`

  return {
    isPlaying,
    title: listen.title,
    artist: listen.artist,
    album: listen.album,
    albumArt: coverArtUrl(caaReleaseMbid, caaId),
    songUrl,
  }
}
