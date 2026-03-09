import { useEffect, useMemo, useState } from 'react'
import type { CmsGuestbookEntry, CmsMedia } from '../../../lib/cms'

type Props = {
  serverData?: Record<string, unknown>
  onOpenEditor?: () => void
}

/** Resolve a CmsMedia relationship to its URL */
function entryImageUrl(image: CmsMedia | string | null | undefined): string | undefined {
  if (!image) return undefined
  if (typeof image === 'string') return undefined
  return image.url ?? undefined
}

/** Deterministic pseudo-random from string hash */
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

/** Generate card position + rotation from entry ID */
function cardTransform(id: string, index: number, total: number) {
  const h = hashCode(id)
  // Spread cards in a grid-like pattern with randomness
  const cols = Math.max(3, Math.ceil(Math.sqrt(total)))
  const col = index % cols
  const row = Math.floor(index / cols)
  const cellW = 100 / cols
  const cellH = 100 / Math.max(1, Math.ceil(total / cols))
  // Position within cell + jitter
  const x = col * cellW + (h % 40) * (cellW - 20) / 40 + 2
  const y = row * cellH + ((h >> 8) % 40) * (cellH - 20) / 40 + 2
  const rotation = ((h % 13) - 6) * 1.2 // -7.2 to +7.2 degrees
  return { x: Math.min(x, 78), y: Math.min(y, 80), rotation }
}

/** Parse Spotify URL to embed URL */
function spotifyEmbedUrl(url: string): string | null {
  // Handle open.spotify.com/track/xxx, /album/xxx, /playlist/xxx (with optional intl-xx)
  const match = url.match(/spotify\.com.*?\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/)
  if (match) {
    return `https://open.spotify.com/embed/${match[1]}/${match[2]}?theme=0`
  }
  // Handle spotify:track:xxx URIs
  const uriMatch = url.match(/spotify:(track|album|playlist|episode):([a-zA-Z0-9]+)/)
  if (uriMatch) {
    return `https://open.spotify.com/embed/${uriMatch[1]}/${uriMatch[2]}?theme=0`
  }
  return null
}

/** Parse YouTube URL to embed URL */
function youtubeEmbedUrl(url: string): string | null {
  const patterns = [
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /youtu\.be\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return `https://www.youtube.com/embed/${match[1]}`
  }
  return null
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}

function GuestbookCard({ entry, index, total }: { entry: CmsGuestbookEntry; index: number; total: number }) {
  const imgUrl = entryImageUrl(entry.image)
  const { x, y, rotation } = cardTransform(entry.id, index, total)
  const [expanded, setExpanded] = useState(false)

  const embedSrc = useMemo(() => {
    if (!entry.embedUrl) return null
    if (entry.embedType === 'spotify') return spotifyEmbedUrl(entry.embedUrl)
    if (entry.embedType === 'youtube') return youtubeEmbedUrl(entry.embedUrl)
    return null
  }, [entry.embedUrl, entry.embedType])

  return (
    <div
      className={`gb-card${expanded ? ' gb-card--expanded' : ''}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `rotate(${rotation}deg)`,
      }}
      onClick={() => setExpanded(!expanded)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') setExpanded(!expanded) }}
    >
      {/* Pin */}
      <div className="gb-card__pin" aria-hidden="true" />

      {/* Author header */}
      <div className="gb-card__author">
        {entry.authorAvatar ? (
          <img
            className="gb-card__avatar"
            src={entry.authorAvatar}
            alt=""
            width={20}
            height={20}
          />
        ) : (
          <span className="gb-card__avatar gb-card__avatar--fallback">
            {entry.authorName.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="gb-card__name">{entry.authorName}</span>
        <span className="gb-card__date">{formatDate(entry.createdAt)}</span>
      </div>

      {/* Canvas image */}
      {imgUrl && (
        <div className="gb-card__image-wrap">
          <img
            className="gb-card__image"
            src={imgUrl}
            alt={`Guestbook entry by ${entry.authorName}`}
            loading="lazy"
          />
        </div>
      )}

      {/* Message */}
      {entry.message && (
        <p className="gb-card__message">{entry.message}</p>
      )}

      {/* Embed */}
      {expanded && embedSrc && (
        <div className="gb-card__embed" onClick={(e) => e.stopPropagation()}>
          {entry.embedType === 'spotify' && (
            <iframe
              src={embedSrc}
              width="100%"
              height="152"
              frameBorder="0"
              allow="encrypted-media"
              loading="lazy"
              title="Spotify embed"
            />
          )}
          {entry.embedType === 'youtube' && (
            <iframe
              src={embedSrc}
              width="100%"
              height="152"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              title="YouTube embed"
            />
          )}
        </div>
      )}

      {/* Embed indicator (when collapsed) */}
      {!expanded && embedSrc && (
        <div className="gb-card__embed-hint">
          {entry.embedType === 'spotify' ? '♪' : '▶'} click to expand
        </div>
      )}
    </div>
  )
}

export function GuestbookApp({ serverData, onOpenEditor }: Props) {
  const initialEntries = (serverData?.guestbookEntries as CmsGuestbookEntry[]) ?? []
  const [entries, setEntries] = useState<CmsGuestbookEntry[]>(initialEntries)
  const [loading, setLoading] = useState(!initialEntries.length)

  useEffect(() => {
    if (initialEntries.length > 0) return
    setLoading(true)
    fetch('/api/guestbook.json')
      .then(r => r.json())
      .then((data: unknown) => setEntries(data as CmsGuestbookEntry[]))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }, [])

  const empty = !loading && entries.length === 0

  return (
    <div className="guestbook">
      {/* Header bar */}
      <div className="guestbook__header">
        <div className="guestbook__header-left">
          <span className="eyebrow">Guestbook</span>
          <span className="guestbook__count">
            {loading ? '...' : `${entries.length} entr${entries.length !== 1 ? 'ies' : 'y'}`}
          </span>
        </div>
        <button
          className="guestbook__sign-btn"
          onClick={onOpenEditor}
          type="button"
        >
          <span className="guestbook__sign-btn-icon">✎</span>
          Sign the Guestbook
        </button>
      </div>

      {/* Board */}
      <div className="guestbook__board">
        {loading && (
          <div className="guestbook__status">Loading entries...</div>
        )}
        {empty && (
          <div className="guestbook__status">
            No entries yet. Be the first to sign the guestbook!
          </div>
        )}

        {entries.map((entry, i) => (
          <GuestbookCard
            key={entry.id}
            entry={entry}
            index={i}
            total={entries.length}
          />
        ))}
      </div>
    </div>
  )
}
