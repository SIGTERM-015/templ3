import { useCallback, useEffect, useMemo, useState } from 'react'
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

/** Spotify logo SVG icon */
function SpotifyIcon() {
  return (
    <svg
      className="gb-card__embed-icon gb-card__embed-icon--spotify"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  )
}

/** YouTube logo SVG icon */
function YouTubeIcon() {
  return (
    <svg
      className="gb-card__embed-icon gb-card__embed-icon--youtube"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

/** Lightbox overlay for viewing images full-size */
function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="gb-lightbox" onClick={onClose} role="dialog" aria-label="Image viewer">
      <button className="gb-lightbox__close" onClick={onClose} type="button" aria-label="Close">
        &times;
      </button>
      <img
        className="gb-lightbox__image"
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  )
}

type CardProps = {
  entry: CmsGuestbookEntry
  index: number
  total: number
  expanded: boolean
  onExpand: (id: string | null) => void
}

function GuestbookCard({ entry, index, total, expanded, onExpand }: CardProps) {
  const imgUrl = entryImageUrl(entry.image)
  const { x, y, rotation } = cardTransform(entry.id, index, total)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const embedSrc = useMemo(() => {
    if (!entry.embedUrl) return null
    if (entry.embedType === 'spotify') return spotifyEmbedUrl(entry.embedUrl)
    if (entry.embedType === 'youtube') return youtubeEmbedUrl(entry.embedUrl)
    return null
  }, [entry.embedUrl, entry.embedType])

  const handleCardClick = useCallback(() => {
    onExpand(expanded ? null : entry.id)
  }, [expanded, entry.id, onExpand])

  const handleImageClick = useCallback((e: React.MouseEvent) => {
    if (expanded) {
      e.stopPropagation()
      setLightboxOpen(true)
    }
  }, [expanded])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onExpand(expanded ? null : entry.id)
  }, [expanded, entry.id, onExpand])

  return (
    <>
      <div
        className={`gb-card${expanded ? ' gb-card--expanded' : ''}`}
        style={{
          left: `${x}%`,
          top: `${y}%`,
          transform: `rotate(${rotation}deg)`,
        }}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
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
          {embedSrc && (
            <span className="gb-card__embed-type">
              {entry.embedType === 'spotify' ? <SpotifyIcon /> : <YouTubeIcon />}
            </span>
          )}
          <span className="gb-card__date">{formatDate(entry.createdAt)}</span>
        </div>

        {/* Canvas image */}
        {imgUrl && (
          <div
            className={`gb-card__image-wrap${expanded ? ' gb-card__image-wrap--clickable' : ''}`}
            onClick={handleImageClick}
          >
            <img
              className="gb-card__image"
              src={imgUrl}
              alt={`Guestbook entry by ${entry.authorName}`}
              loading="lazy"
            />
            {expanded && (
              <div className="gb-card__image-zoom" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                  <path d="M11 8v6M8 11h6" />
                </svg>
              </div>
            )}
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
            {entry.embedType === 'spotify' ? <SpotifyIcon /> : <YouTubeIcon />}
            <span>click to expand</span>
          </div>
        )}
      </div>

      {/* Image lightbox */}
      {lightboxOpen && imgUrl && (
        <ImageLightbox
          src={imgUrl}
          alt={`Guestbook entry by ${entry.authorName}`}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  )
}

export function GuestbookApp({ serverData, onOpenEditor }: Props) {
  const initialEntries = (serverData?.guestbookEntries as CmsGuestbookEntry[]) ?? []
  const [entries, setEntries] = useState<CmsGuestbookEntry[]>(initialEntries)
  const [loading, setLoading] = useState(!initialEntries.length)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (initialEntries.length > 0) return
    setLoading(true)
    fetch('/api/guestbook.json')
      .then(r => r.json())
      .then((data: unknown) => setEntries(data as CmsGuestbookEntry[]))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }, [])

  const handleBoardClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Only collapse if clicking the board itself, not a card
    if (e.target === e.currentTarget) {
      setExpandedId(null)
    }
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
      <div className="guestbook__board" onClick={handleBoardClick}>
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
            expanded={expandedId === entry.id}
            onExpand={setExpandedId}
          />
        ))}
      </div>
    </div>
  )
}
