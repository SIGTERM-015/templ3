import { useCallback, useEffect, useMemo, useState } from 'react'
import type { MediaDetail, MediaEntry, MediaType } from '../../../lib/mediaLog'
import {
  MEDIA_TYPES,
  NOW_CATEGORIES,
  STATUS_GLYPHS,
  STATUS_LABELS,
  TYPE_GLYPHS,
  TYPE_LABELS,
} from '../../../lib/mediaLog'
import { useCmsResource } from '../../../hooks/useCmsResource'
import { NowPlaying, NowCard } from '../../NowPlaying'
import { formatDate } from '../../../lib/formatDate'
import { safeHref } from '../../../lib/safeUrl'

type Props = {
  serverData?: Record<string, unknown>
  onOpenApp?: (appId: string) => void
  onUpdateRoute?: (route: string) => void
}

const ratingStars = (n: number) =>
  '★'.repeat(Math.round(n / 2)) + '☆'.repeat(5 - Math.round(n / 2))

export function MediaApp({ serverData, onUpdateRoute }: Props) {
  const initialMedia = (serverData?.media as MediaEntry[] | null) ?? []
  const initialDetail = (serverData?.mediaItem as MediaDetail | undefined) ?? null

  const { data: items, loading } = useCmsResource<MediaEntry[]>(
    initialMedia,
    initialMedia.length ? null : '/api/media.json',
  )

  const [filter, setFilter] = useState<MediaType | 'all'>('all')
  const [selectedKey, setSelectedKey] = useState<string | null>(initialDetail?.key ?? null)

  // Sync window route with the deep-linked item on initial load
  useEffect(() => {
    if (initialDetail) onUpdateRoute?.(`/media/${initialDetail.key}`)
  }, [])

  // The detail (synopsis, credits) is fetched only when an entry is opened
  const seededDetail = initialDetail?.key === selectedKey ? initialDetail : null
  const { data: fetchedDetail } = useCmsResource<MediaDetail | null>(
    seededDetail,
    selectedKey && !seededDetail ? `/api/media/${selectedKey}.json` : null,
  )
  const selectedEntry = selectedKey ? items.find((i) => i.key === selectedKey) : undefined
  const detail = fetchedDetail?.key === selectedKey ? fetchedDetail : null
  const selected: MediaEntry | MediaDetail | undefined = detail ?? selectedEntry ?? seededDetail ?? undefined

  const selectItem = useCallback((item: MediaEntry) => {
    setSelectedKey(item.key)
    onUpdateRoute?.(`/media/${item.key}`)
  }, [onUpdateRoute])

  const goBack = useCallback(() => {
    setSelectedKey(null)
    onUpdateRoute?.('/media')
  }, [onUpdateRoute])

  const presentTypes = useMemo(
    () => MEDIA_TYPES.filter((t) => items.some((i) => i.type === t)),
    [items],
  )

  const nowGroups = useMemo(
    () =>
      NOW_CATEGORIES.map((cat) => ({
        ...cat,
        item: items.find((i) => i.status === 'in-progress' && cat.types.includes(i.type)),
      })).filter((g): g is typeof g & { item: MediaEntry } => !!g.item),
    [items],
  )

  const filtered = useMemo(
    () => (filter === 'all' ? items : items.filter((i) => i.type === filter)),
    [items, filter],
  )

  return (
    <div className="mediapp">
      {!selected && (
        <div className="mediapp-now">
          <div className="mediapp-now__grid">
            <div className="mediapp-now__card">
              <h3 className="eyebrow">Now listening</h3>
              <NowPlaying />
            </div>
            {nowGroups.map((group) => (
              <div key={group.key} className="mediapp-now__card">
                <h3 className="eyebrow">{group.label}</h3>
                <NowCard
                  cover={group.item.cover}
                  title={group.item.title}
                  subtitle={TYPE_LABELS[group.item.type]}
                  onClick={() => selectItem(group.item)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {!selected && (
        <div className="mediapp-toolbar">
          <div className="mediapp-filters">
            <button
              className={`mediapp-filter ${filter === 'all' ? 'mediapp-filter--active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            {presentTypes.map((type) => (
              <button
                key={type}
                className={`mediapp-filter ${filter === type ? 'mediapp-filter--active' : ''}`}
                onClick={() => setFilter(type)}
                title={TYPE_LABELS[type]}
              >
                {TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && <div className="mediapp-loading">Loading...</div>}

      {!selected && !loading && (
        <div className="mediapp-grid">
          {filtered.map((item) => (
            <button key={item.key} className="mediapp-card" onClick={() => selectItem(item)}>
              <div
                className="mediapp-card__cover"
                style={item.cover ? { backgroundImage: `url(${item.cover})` } : undefined}
              >
                {!item.cover && (
                  <span className="mediapp-card__placeholder">{TYPE_GLYPHS[item.type]}</span>
                )}
              </div>
              <div className="mediapp-card__info">
                <span className="mediapp-card__title">{item.title}</span>
                <span className="mediapp-card__meta">
                  {item.score != null && <span className="mediapp-card__rating">{item.score}/10</span>}
                  <span
                    className="mediapp-card__status"
                    data-status={item.status}
                    title={STATUS_LABELS[item.status]}
                  >
                    {STATUS_GLYPHS[item.status]}
                  </span>
                </span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && <div className="mediapp-empty">Nothing here yet</div>}
        </div>
      )}

      {selected && (
        <div className="mediapp-detail">
          <button className="gazette-back" onClick={goBack}>← Back</button>
          <div className="mediapp-detail__header">
            {selected.cover && (
              <img
                className="mediapp-detail__cover"
                src={selected.cover}
                alt={selected.title}
                loading="lazy"
                decoding="async"
              />
            )}
            <div className="mediapp-detail__meta">
              <h2 className="mediapp-detail__title">{selected.title}</h2>
              {detail && (detail.creators.length > 0 || detail.year) && (
                <span className="mediapp-detail__creator">
                  {[detail.creators.join(', '), detail.year].filter(Boolean).join(' · ')}
                </span>
              )}
              <div className="mediapp-detail__tags">
                <span className="tag">{TYPE_LABELS[selected.type]}</span>
                <span className="tag" data-status={selected.status}>
                  {STATUS_GLYPHS[selected.status]} {STATUS_LABELS[selected.status]}
                </span>
                {detail?.genres.map((genre) => (
                  <span key={genre} className="tag">{genre}</span>
                ))}
              </div>
              {selected.score != null && (
                <div className="mediapp-detail__rating">
                  <span className="mediapp-detail__stars">{ratingStars(selected.score)}</span>
                  <span className="mediapp-detail__score">{selected.score}/10</span>
                </div>
              )}
              {selected.date && (
                <span className="mediapp-detail__date">{formatDate(selected.date)}</span>
              )}
            </div>
          </div>
          {selected.notes && <p className="mediapp-detail__review">{selected.notes}</p>}
          {detail?.synopsis && <p className="mediapp-detail__synopsis">{detail.synopsis}</p>}
          {detail?.sourceUrl && (
            <div className="mediapp-detail__links">
              <a
                href={safeHref(detail.sourceUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="button--ghost"
              >
                ↗ View on {detail.sourceName}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
