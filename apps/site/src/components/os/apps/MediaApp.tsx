import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CmsFavMedia, CmsMedia, CmsPost } from '../../../lib/cms'
import { NowPlaying, NowCard } from '../../NowPlaying'

const TYPE_LABELS: Record<string, string> = {
  anime: '🎌 Anime',
  manga: '📖 Manga',
  game: '🎮 Games',
  movie: '🎬 Movies',
  series: '📺 Series',
  book: '📚 Books',
  music: '🎵 Music',
  other: '📦 Other',
}

const STATUS_LABELS: Record<string, string> = {
  completed: '✓ Completed',
  'in-progress': '▶ In Progress',
  dropped: '✕ Dropped',
  planned: '◌ Planned',
}

type Props = {
  serverData?: Record<string, unknown>
  onOpenApp?: (appId: string) => void
}

export function MediaApp({ serverData, onOpenApp }: Props) {
  const initialMedia = (serverData?.media as CmsFavMedia[]) ?? []
  const [items, setItems] = useState<CmsFavMedia[]>(initialMedia)
  const [loading, setLoading] = useState(!initialMedia.length)
  const [filter, setFilter] = useState<string>('all')
  const [selected, setSelected] = useState<CmsFavMedia | null>(null)

  useEffect(() => {
    if (initialMedia.length > 0) return
    fetch('/api/favourite-media.json')
      .then(r => r.json())
      .then((data: CmsFavMedia[]) => setItems(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const types = useMemo(() => {
    const set = new Set(items.map(i => i.mediaType))
    return Array.from(set).sort()
  }, [items])

  const filtered = useMemo(() => {
    if (filter === 'all') return items
    return items.filter(i => i.mediaType === filter)
  }, [items, filter])

  const coverUrl = (item: CmsFavMedia): string | undefined => {
    if (!item.coverImage) return undefined
    if (typeof item.coverImage === 'string') return item.coverImage
    return (item.coverImage as CmsMedia).url
  }

  const blogSlug = (item: CmsFavMedia): string | undefined => {
    if (!item.blogPost) return undefined
    if (typeof item.blogPost === 'string') return undefined
    return (item.blogPost as CmsPost).slug
  }

  const ratingStars = (n: number) => {
    return '★'.repeat(Math.round(n / 2)) + '☆'.repeat(5 - Math.round(n / 2))
  }

  const goBack = useCallback(() => setSelected(null), [])

  const inProgress = useMemo(
    () => items.filter(i => i.progress === 'in-progress'),
    [items],
  )

  const NOW_CATEGORIES: { key: string; label: string; types: string[] }[] = [
    { key: 'listening', label: 'Now listening', types: ['music'] },
    { key: 'watching', label: 'Now watching', types: ['anime', 'series', 'movie'] },
    { key: 'reading', label: 'Now reading', types: ['manga', 'book'] },
    { key: 'playing', label: 'Now playing', types: ['game'] },
  ]

  type NowGroup = { key: string; label: string; types: string[]; items: CmsFavMedia[] }

  const nowGroups: NowGroup[] = useMemo(() => {
    return NOW_CATEGORIES.map(cat => ({
      ...cat,
      items: inProgress.filter((i: CmsFavMedia) => cat.types.includes(i.mediaType)),
    })).filter((g): g is NowGroup => g.items.length > 0)
  }, [inProgress])

  return (
    <div className="mediapp">
      {!selected && (
        <div className="mediapp-now">
          <div className="mediapp-now__grid">
            <div className="mediapp-now__card">
              <h3 className="eyebrow">Now listening</h3>
              <NowPlaying />
            </div>
            {nowGroups.map((group: NowGroup) => {
              const item = group.items[0]
              const cover = coverUrl(item)
              return (
                <div key={group.key} className="mediapp-now__card">
                  <h3 className="eyebrow">{group.label}</h3>
                  <NowCard
                    cover={cover}
                    title={item.title}
                    onClick={() => setSelected(item)}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="mediapp-toolbar">
        <div className="mediapp-filters">
          <button
            className={`mediapp-filter ${filter === 'all' ? 'mediapp-filter--active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          {types.map(t => (
            <button
              key={t}
              className={`mediapp-filter ${filter === t ? 'mediapp-filter--active' : ''}`}
              onClick={() => setFilter(t)}
            >
              {TYPE_LABELS[t] || t}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="mediapp-loading">Loading...</div>}

      {!selected && !loading && (
        <div className="mediapp-grid">
          {filtered.map(item => {
            const cover = coverUrl(item)
            return (
              <button
                key={item.id}
                className="mediapp-card"
                onClick={() => setSelected(item)}
              >
                <div
                  className="mediapp-card__cover"
                  style={cover ? { backgroundImage: `url(${cover})` } : undefined}
                >
                  {!cover && <span className="mediapp-card__placeholder">
                    {TYPE_LABELS[item.mediaType]?.slice(0, 2) || '📦'}
                  </span>}
                </div>
                <div className="mediapp-card__info">
                  <span className="mediapp-card__title">{item.title}</span>
                  <span className="mediapp-card__meta">
                    {item.rating && <span className="mediapp-card__rating">{item.rating}/10</span>}
                    <span className="mediapp-card__status" data-status={item.progress}>
                      {STATUS_LABELS[item.progress]?.slice(0, 1) || '?'}
                    </span>
                  </span>
                </div>
              </button>
            )
          })}
          {filtered.length === 0 && !loading && (
            <div className="mediapp-empty">Nothing here yet</div>
          )}
        </div>
      )}

      {selected && (
        <div className="mediapp-detail">
          <button className="gazette-back" onClick={goBack}>← Back</button>
          <div className="mediapp-detail__header">
            {coverUrl(selected) && (
              <img className="mediapp-detail__cover" src={coverUrl(selected)} alt={selected.title} />
            )}
            <div className="mediapp-detail__meta">
              <h2 className="mediapp-detail__title">{selected.title}</h2>
              <div className="mediapp-detail__tags">
                <span className="tag">{TYPE_LABELS[selected.mediaType] || selected.mediaType}</span>
                <span className="tag" data-status={selected.progress}>
                  {STATUS_LABELS[selected.progress] || selected.progress}
                </span>
              </div>
              {selected.rating && (
                <div className="mediapp-detail__rating">
                  <span className="mediapp-detail__stars">{ratingStars(selected.rating)}</span>
                  <span className="mediapp-detail__score">{selected.rating}/10</span>
                </div>
              )}
              {selected.completedAt && (
                <span className="mediapp-detail__date">
                  {new Date(selected.completedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          </div>
          {selected.review && (
            <p className="mediapp-detail__review">{selected.review}</p>
          )}
          <div className="mediapp-detail__links">
            {blogSlug(selected) && (
              <button
                className="button--ghost"
                onClick={() => onOpenApp?.('gazette')}
              >
                📝 Read blog review
              </button>
            )}
            {selected.externalReviewUrl && (
              <a
                href={selected.externalReviewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="button--ghost"
              >
                ↗ External review
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
