// The media log shown in the Media app, sourced from Magpie (the user's Yamtrack fork).
// Browser-safe: types, labels and key parsing only. Fetching lives in lib/magpie.ts.

export const MEDIA_TYPES = ['tv', 'movie', 'anime', 'manga', 'game', 'book', 'comic', 'boardgame'] as const
export type MediaType = (typeof MEDIA_TYPES)[number]

/** Magpie's status ints; 0 (planning) never reaches the site. */
export type MediaStatus = 'in-progress' | 'paused' | 'completed' | 'dropped'

export const STATUS_FROM_MAGPIE: Record<number, MediaStatus> = {
  1: 'in-progress',
  2: 'paused',
  3: 'completed',
  4: 'dropped',
}

export type MediaEntry = {
  /** `${type}-${source}-${id}`: stable, URL-safe, used in /media/<key> */
  key: string
  type: MediaType
  title: string
  cover?: string
  status: MediaStatus
  /** 0–10, one decimal */
  score?: number
  /** The user's own notes, shown as the review */
  notes?: string
  /** When it was finished, or last progressed for ongoing items */
  date?: string
}

export type MediaDetail = MediaEntry & {
  synopsis?: string
  creators: string[]
  year?: string
  genres: string[]
  sourceUrl?: string
  sourceName?: string
}

export const TYPE_LABELS: Record<MediaType, string> = {
  tv: 'Series',
  movie: 'Movies',
  anime: 'Anime',
  manga: 'Manga',
  game: 'Games',
  book: 'Books',
  comic: 'Comics',
  boardgame: 'Board games',
}

export const TYPE_GLYPHS: Record<MediaType, string> = {
  tv: '▭',
  movie: '◉',
  anime: '✦',
  manga: '▤',
  game: '◆',
  book: '❙',
  comic: '▦',
  boardgame: '⬡',
}

export const STATUS_LABELS: Record<MediaStatus, string> = {
  'in-progress': 'In progress',
  paused: 'Paused',
  completed: 'Completed',
  dropped: 'Dropped',
}

export const STATUS_GLYPHS: Record<MediaStatus, string> = {
  'in-progress': '▶',
  paused: '❚❚',
  completed: '✓',
  dropped: '✕',
}

export const NOW_CATEGORIES: { key: string; label: string; types: MediaType[] }[] = [
  { key: 'watching', label: 'Now watching', types: ['tv', 'anime', 'movie'] },
  { key: 'reading', label: 'Now reading', types: ['manga', 'book', 'comic'] },
  { key: 'playing', label: 'Now playing', types: ['game', 'boardgame'] },
]

const SOURCE_PATTERN = /^[a-z]+$/
const ID_PATTERN = /^[\w.]+$/

export type MediaKey = { type: MediaType; source: string; id: string }

/**
 * Parses `type-source-id`. Anything else is rejected before it can reach Magpie, so
 * made-up URLs can't spend its rate limit or fill the cache.
 */
export function parseMediaKey(key: string | undefined): MediaKey | null {
  if (!key) return null
  const [type, source, ...rest] = key.split('-')
  const id = rest.join('-')
  if (!(MEDIA_TYPES as readonly string[]).includes(type)) return null
  if (!SOURCE_PATTERN.test(source ?? '') || !ID_PATTERN.test(id)) return null
  return { type: type as MediaType, source, id }
}

export function mediaKey({ type, source, id }: MediaKey): string {
  return `${type}-${source}-${id}`
}
