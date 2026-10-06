import { TTL } from './cms'
import { cachedJson } from './edgeCache'
import { workerEnv } from './env'
import {
  mediaKey,
  STATUS_FROM_MAGPIE,
  type MediaDetail,
  type MediaEntry,
  type MediaKey,
  type MediaType,
} from './mediaLog'

// Server-only: reads the Magpie (Yamtrack fork) API with a read-only token.
// Client components import types and labels from lib/mediaLog.ts instead.

const DEFAULT_MAGPIE_URL = 'https://magpie.yellowumbrella.dev'
const PAGE_SIZE = 200
const MAX_PAGES = 20

type MagpieItem = {
  media_id: string
  source: string
  media_type: string
  title: string
  image?: string | null
}

type MagpieListEntry = {
  item: MagpieItem
  status: number | null
  score: number | null
  notes: string
  progressed_at: string | null
  end_date: string | null
  created_at: string
}

type MagpieListResponse = {
  pagination: { next: string | null }
  results: MagpieListEntry[]
}

type MagpieDetailResponse = {
  synopsis?: string | null
  source_url?: string | null
  genres?: string[]
  details?: Record<string, unknown>
}

// TMDB's grey "no image" placeholder, which Magpie returns when a title has no cover
const PLACEHOLDER_IMAGE = /\/no-image|img_none|placeholder/i

async function magpieFetch<T>(path: string): Promise<T | null> {
  const [baseUrl, token] = await Promise.all([
    workerEnv('MAGPIE_API_URL'),
    workerEnv('MAGPIE_API_TOKEN'),
  ])
  if (!token) return null
  try {
    const response = await fetch(`${(baseUrl || DEFAULT_MAGPIE_URL).replace(/\/$/, '')}${path}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    })
    if (!response.ok) return null
    return (await response.json()) as T
  } catch {
    return null
  }
}

function toEntry(raw: MagpieListEntry): MediaEntry | null {
  const status = raw.status === null ? undefined : STATUS_FROM_MAGPIE[raw.status]
  if (!status) return null
  const { media_type, source, media_id, title, image } = raw.item
  return {
    key: mediaKey({ type: media_type as MediaType, source, id: media_id }),
    type: media_type as MediaType,
    title,
    cover: image && !PLACEHOLDER_IMAGE.test(image) ? image : undefined,
    status,
    score: raw.score ?? undefined,
    notes: raw.notes.trim() || undefined,
    date: raw.end_date ?? raw.progressed_at ?? undefined,
  }
}

const byDateDesc = (a: MediaEntry, b: MediaEntry) => {
  if (!a.date) return b.date ? 1 : 0
  if (!b.date) return -1
  return b.date.localeCompare(a.date)
}

/**
 * Everything tracked in Magpie except planned items, newest first. `null` when Magpie
 * is unreachable, so callers answer an uncached 503 instead of an empty log.
 */
export async function getMediaLog(): Promise<MediaEntry[] | null> {
  return cachedJson('magpie/list/v1', TTL.STANDARD, async () => {
    const entries: MediaEntry[] = []
    for (let page = 0; page < MAX_PAGES; page++) {
      const data = await magpieFetch<MagpieListResponse>(
        `/api/v1/media/?limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`,
      )
      if (!data) return null
      for (const raw of data.results) {
        const entry = toEntry(raw)
        if (entry) entries.push(entry)
      }
      if (!data.pagination.next) break
    }
    return entries.sort(byDateDesc)
  })
}

const asStrings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : []

function firstDate(details: Record<string, unknown>): string | undefined {
  for (const field of ['release_date', 'first_air_date', 'start_date', 'publish_date']) {
    const value = details[field]
    if (typeof value === 'string' && /^\d{4}/.test(value)) return value.slice(0, 4)
  }
  return undefined
}

const SOURCE_NAMES: Record<string, string> = {
  tmdb: 'TMDB',
  igdb: 'IGDB',
  mal: 'MyAnimeList',
  anilist: 'AniList',
  openlibrary: 'Open Library',
  hardcover: 'Hardcover',
  comicvine: 'Comic Vine',
  bgg: 'BoardGameGeek',
  mangaupdates: 'MangaUpdates',
}

/** One entry with its synopsis and credits, or `null` if it isn't in the public log. */
export async function getMediaDetail(key: MediaKey): Promise<MediaDetail | null> {
  const k = mediaKey(key)
  const [log, raw] = await Promise.all([
    getMediaLog(),
    cachedJson(`magpie/detail/v1/${k}`, TTL.LONG, () =>
      magpieFetch<MagpieDetailResponse>(`/api/v1/media/${key.type}/${key.source}/${key.id}/`),
    ),
  ])
  // Only entries in the log are public: this keeps planned items and made-up keys out
  const entry = log?.find((e) => e.key === k)
  if (!entry || !raw) return null

  const details = raw.details ?? {}
  return {
    ...entry,
    synopsis: raw.synopsis?.trim() || undefined,
    creators: [...asStrings(details.studios), ...asStrings(details.companies), ...asStrings(details.authors)].slice(0, 3),
    year: firstDate(details),
    genres: asStrings(raw.genres).slice(0, 5),
    sourceUrl: raw.source_url ?? undefined,
    sourceName: SOURCE_NAMES[key.source] ?? key.source,
  }
}
