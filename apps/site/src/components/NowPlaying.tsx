import { useEffect, useRef, useState } from 'react'
import type { NowPlayingTrack } from '../lib/listenbrainz'
import { NowCard } from './NowCard'

type NowPlayingData = NowPlayingTrack | { isPlaying: false }

const POLL_INTERVAL = 30_000

export function NowPlaying() {
  const [data, setData] = useState<NowPlayingData | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  useEffect(() => {
    let cancelled = false

    const poll = async () => {
      if (document.hidden) return
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

  return (
    <NowCard
      cover={data.albumArt}
      title={data.title}
      subtitle={data.artist}
      href={data.songUrl}
      isPlaying={data.isPlaying}
    />
  )
}
