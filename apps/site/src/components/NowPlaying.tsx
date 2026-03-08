import { useEffect, useRef, useState } from 'react'
import type { SpotifyTrack } from '../lib/spotify'

type NowPlayingData = SpotifyTrack | { isPlaying: false }

const POLL_INTERVAL = 30_000

export type NowCardProps = {
  cover?: string
  title: string
  subtitle?: string
  href?: string
  onClick?: () => void
  isPlaying?: boolean
}

export function NowCard({ cover, title, subtitle, href, onClick, isPlaying }: NowCardProps) {
  const Tag = href ? 'a' : 'button'
  const linkProps = href
    ? { href, target: '_blank' as const, rel: 'noopener noreferrer' }
    : { onClick }

  return (
    <Tag className="now-card" {...(linkProps as any)}>
      <div
        className="now-card__cover"
        style={cover ? { backgroundImage: `url(${cover})` } : undefined}
      >
        {!cover && <span className="now-card__placeholder">?</span>}
        {isPlaying && (
          <div className="now-card__bars" aria-hidden="true">
            <span className="now-card__bar" />
            <span className="now-card__bar" />
            <span className="now-card__bar" />
          </div>
        )}
      </div>
      <span className="now-card__title">{title}</span>
      {subtitle && <span className="now-card__subtitle">{subtitle}</span>}
    </Tag>
  )
}

export function NowPlaying() {
  const [data, setData] = useState<NowPlayingData | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    let cancelled = false

    const poll = async () => {
      try {
        const res = await fetch('/api/now-playing.json')
        if (!res.ok) return
        const json = (await res.json()) as NowPlayingData
        if (!cancelled) setData(json)
      } catch { /* silent */ }
    }

    poll()
    timerRef.current = setInterval(poll, POLL_INTERVAL)

    return () => {
      cancelled = true
      clearInterval(timerRef.current)
    }
  }, [])

  if (!data || !('title' in data)) return null

  const track = data as SpotifyTrack

  return (
    <NowCard
      cover={track.albumArt}
      title={track.title}
      subtitle={track.artist}
      href={track.songUrl}
      isPlaying={track.isPlaying}
    />
  )
}
