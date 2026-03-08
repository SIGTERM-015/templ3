import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CmsFavMedia, CmsMedia, CmsMediaStatus, CmsMediaType, CmsPost } from '../../../lib/cms'
import { NowPlaying, NowCard } from '../../NowPlaying'

// ─── Fallback static data (used when CMS config not available) ──────────────

const FALLBACK_TYPE_LABELS: Record<string, string> = {
  anime: 'Anime',
  manga: 'Manga',
  game: 'Games',
  movie: 'Movies',
  series: 'Series',
  book: 'Books',
  music: 'Music',
  other: 'Other',
}

const FALLBACK_STATUS_LABELS: Record<string, string> = {
  completed: 'Completed',
  'in-progress': 'In Progress',
  dropped: 'Dropped',
  planned: 'Planned',
}

const FALLBACK_STATUS_GLYPHS: Record<string, string> = {
  completed: '✓',
  'in-progress': '▶',
  dropped: '✕',
  planned: '◌',
}

const FALLBACK_NOW_CATEGORIES = [
  { key: 'listening', label: 'Now listening', types: ['music'] },
  { key: 'watching', label: 'Now watching', types: ['anime', 'series', 'movie'] },
  { key: 'reading', label: 'Now reading', types: ['manga', 'book'] },
  { key: 'playing', label: 'Now playing', types: ['game'] },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

function resolveMediaTypeValue(mediaType: CmsMediaType | string): string {
  if (typeof mediaType === 'string') return mediaType
  return mediaType.value
}

function resolveStatusValue(progress: CmsMediaStatus | string): string {
  if (typeof progress === 'string') return progress
  return progress.value
}

function resolveMediaUrl(value: CmsMedia | string | null | undefined): string | undefined {
  if (!value) return undefined
  if (typeof value === 'string') return undefined
  return value.url ?? undefined
}

/** Get the icon URL from a CmsMediaType or CmsMediaStatus relationship */
function typeIconUrl(mediaType: CmsMediaType | string | undefined): string | undefined {
  if (!mediaType || typeof mediaType === 'string') return undefined
  return resolveMediaUrl(mediaType.icon)
}

function statusIconUrl(progress: CmsMediaStatus | string | undefined): string | undefined {
  if (!progress || typeof progress === 'string') return undefined
  return resolveMediaUrl(progress.icon)
}

// ─── Types ───────────────────────────────────────────────────────────────────

type NowGroup = {
  key: string
  label: string
  typeValues: string[]
  items: CmsFavMedia[]
}

type Props = {
  serverData?: Record<string, unknown>
  onOpenApp?: (appId: string) => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MediaApp({ serverData, onOpenApp }: Props) {
  const initialMedia = (serverData?.media as CmsFavMedia[]) ?? []
  const initialMediaTypes = (serverData?.mediaTypes as CmsMediaType[]) ?? []
  const initialMediaStatuses = (serverData?.mediaStatuses as CmsMediaStatus[]) ?? []

  const [items, setItems] = useState<CmsFavMedia[]>(initialMedia)
  const [mediaTypes, setMediaTypes] = useState<CmsMediaType[]>(initialMediaTypes)
  const [mediaStatuses, setMediaStatuses] = useState<CmsMediaStatus[]>(initialMediaStatuses)
  const [loading, setLoading] = useState(!initialMedia.length)
  const [filter, setFilter] = useState<string>('all')
  const [selected, setSelected] = useState<CmsFavMedia | null>(null)

  // Fetch missing data client-side
  useEffect(() => {
    const fetches: Promise<void>[] = []

    if (initialMedia.length === 0) {
      fetches.push(
        fetch('/api/favourite-media.json')
          .then(r => r.json() as Promise<CmsFavMedia[]>)
          .then((data) => setItems(data))
          .catch(() => {}),
      )
    }

    if (initialMediaTypes.length === 0) {
      fetches.push(
        fetch('/api/media-types.json')
          .then(r => r.json() as Promise<CmsMediaType[]>)
          .then((data) => setMediaTypes(data))
          .catch(() => {}),
      )
    }

    if (initialMediaStatuses.length === 0) {
      fetches.push(
        fetch('/api/media-statuses.json')
          .then(r => r.json() as Promise<CmsMediaStatus[]>)
          .then((data) => setMediaStatuses(data))
          .catch(() => {}),
      )
    }

    if (fetches.length > 0) {
      Promise.all(fetches).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  // ── Build lookup maps from CMS config ──────────────────────────────────────

  /** Map from mediaType.value → CmsMediaType object */
  const typeMap = useMemo(() => {
    const map = new Map<string, CmsMediaType>()
    for (const t of mediaTypes) map.set(t.value, t)
    return map
  }, [mediaTypes])

  /** Map from mediaStatus.value → CmsMediaStatus object */
  const statusMap = useMemo(() => {
    const map = new Map<string, CmsMediaStatus>()
    for (const s of mediaStatuses) map.set(s.value, s)
    return map
  }, [mediaStatuses])

  /** "Now X" categories derived from mediaTypes with a nowCategory */
  const nowCategories = useMemo((): { key: string; label: string; typeValues: string[] }[] => {
    if (mediaTypes.length === 0) {
      return FALLBACK_NOW_CATEGORIES.map(c => ({ key: c.key, label: c.label, typeValues: c.types }))
    }

    // Group types by nowCategory
    const grouped = new Map<string, { label: string; typeValues: string[] }>()
    for (const t of mediaTypes) {
      if (!t.nowCategory || t.nowCategory === 'none') continue
      const key = t.nowCategory
      if (!grouped.has(key)) {
        grouped.set(key, {
          label: t.nowLabel || `Now ${key}`,
          typeValues: [],
        })
      }
      grouped.get(key)!.typeValues.push(t.value)
    }

    return Array.from(grouped.entries()).map(([key, val]) => ({ key, ...val }))
  }, [mediaTypes])

  // ── Helpers using CMS data ────────────────────────────────────────────────

  const getTypeLabel = (mediaType: CmsMediaType | string): string => {
    const value = resolveMediaTypeValue(mediaType)
    if (typeof mediaType !== 'string') return mediaType.label
    const found = typeMap.get(value)
    if (found) return found.label
    return FALLBACK_TYPE_LABELS[value] || value
  }

  const getTypeGlyph = (mediaType: CmsMediaType | string): string => {
    const value = resolveMediaTypeValue(mediaType)
    if (typeof mediaType !== 'string') return mediaType.glyph || value.slice(0, 2).toUpperCase()
    const found = typeMap.get(value)
    return found?.glyph || value.slice(0, 2).toUpperCase()
  }

  const getStatusLabel = (progress: CmsMediaStatus | string): string => {
    const value = resolveStatusValue(progress)
    if (typeof progress !== 'string') return progress.label
    const found = statusMap.get(value)
    if (found) return found.label
    return FALLBACK_STATUS_LABELS[value] || value
  }

  const getStatusGlyph = (progress: CmsMediaStatus | string): string => {
    const value = resolveStatusValue(progress)
    if (typeof progress !== 'string') return progress.glyph || '?'
    const found = statusMap.get(value)
    return found?.glyph || FALLBACK_STATUS_GLYPHS[value] || '?'
  }

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

  const ratingStars = (n: number) =>
    '★'.repeat(Math.round(n / 2)) + '☆'.repeat(5 - Math.round(n / 2))

  const goBack = useCallback(() => setSelected(null), [])

  // ── Derived data ──────────────────────────────────────────────────────────

  /** Unique type values present in the current items list */
  const presentTypes = useMemo((): string[] => {
    const seen = new Set<string>()
    const result: string[] = []
    for (const item of items) {
      const v = resolveMediaTypeValue(item.mediaType)
      if (!seen.has(v)) { seen.add(v); result.push(v) }
    }
    // Sort by CMS order if available
    if (mediaTypes.length > 0) {
      const orderMap = new Map<string, number>(mediaTypes.map((t: CmsMediaType, i: number) => [t.value, t.order ?? i]))
      result.sort((a: string, b: string) => (orderMap.get(a) ?? 99) - (orderMap.get(b) ?? 99))
    } else {
      result.sort()
    }
    return result
  }, [items, mediaTypes])

  const inProgress = useMemo(
    () => items.filter((i: CmsFavMedia) => resolveStatusValue(i.progress) === 'in-progress'),
    [items],
  )

  const nowGroups: NowGroup[] = useMemo(() => {
    return nowCategories
      .map((cat: { key: string; label: string; typeValues: string[] }) => ({
        ...cat,
        items: inProgress.filter((i: CmsFavMedia) => cat.typeValues.includes(resolveMediaTypeValue(i.mediaType))),
      }))
      .filter((g: { key: string; label: string; typeValues: string[]; items: CmsFavMedia[] }): g is NowGroup => g.items.length > 0)
  }, [inProgress, nowCategories])

  const filtered = useMemo((): CmsFavMedia[] => {
    if (filter === 'all') return items
    return items.filter((i: CmsFavMedia) => resolveMediaTypeValue(i.mediaType) === filter)
  }, [items, filter])

  // ── Render ────────────────────────────────────────────────────────────────

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
          {presentTypes.map((typeValue: string) => {
            const cmsType = typeMap.get(typeValue)
            const iconUrl = typeIconUrl(cmsType)
            const label = cmsType ? cmsType.label : (FALLBACK_TYPE_LABELS[typeValue] || typeValue)

            return (
              <button
                key={typeValue}
                className={`mediapp-filter ${filter === typeValue ? 'mediapp-filter--active' : ''}`}
                onClick={() => setFilter(typeValue)}
                title={label}
              >
                {iconUrl ? (
                  <img src={iconUrl} alt={label} className="mediapp-filter__icon" />
                ) : (
                  cmsType?.glyph || label
                )}
              </button>
            )
          })}
        </div>
      </div>

      {loading && <div className="mediapp-loading">Loading...</div>}

      {!selected && !loading && (
        <div className="mediapp-grid">
          {filtered.map((item: CmsFavMedia) => {
            const cover = coverUrl(item)
            const typeValue = resolveMediaTypeValue(item.mediaType)
            const cmsType = typeMap.get(typeValue)
            const tIconUrl = typeIconUrl(cmsType ?? item.mediaType)

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
                  {!cover && (
                    <span className="mediapp-card__placeholder">
                      {tIconUrl ? (
                        <img src={tIconUrl} alt={getTypeLabel(item.mediaType)} className="mediapp-card__type-icon" />
                      ) : (
                        getTypeGlyph(item.mediaType)
                      )}
                    </span>
                  )}
                </div>
                <div className="mediapp-card__info">
                  <span className="mediapp-card__title">{item.title}</span>
                  <span className="mediapp-card__meta">
                    {item.rating && <span className="mediapp-card__rating">{item.rating}/10</span>}
                    <span
                      className="mediapp-card__status"
                      data-status={resolveStatusValue(item.progress)}
                      title={getStatusLabel(item.progress)}
                    >
                      {(() => {
                        const sIcon = statusIconUrl(typeof item.progress !== 'string' ? item.progress : undefined)
                        return sIcon
                          ? <img src={sIcon} alt={getStatusLabel(item.progress)} className="mediapp-card__status-icon" />
                          : getStatusGlyph(item.progress)
                      })()}
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
                {/* Type tag */}
                {(() => {
                  const typeValue = resolveMediaTypeValue(selected.mediaType)
                  const cmsType = typeMap.get(typeValue)
                  const tUrl = typeIconUrl(cmsType ?? selected.mediaType)
                  return (
                    <span className="tag">
                      {tUrl
                        ? <img src={tUrl} alt={getTypeLabel(selected.mediaType)} className="tag__icon" />
                        : null}
                      {getTypeLabel(selected.mediaType)}
                    </span>
                  )
                })()}
                {/* Status tag */}
                {(() => {
                  const statusValue = resolveStatusValue(selected.progress)
                  const sUrl = statusIconUrl(typeof selected.progress !== 'string' ? selected.progress : undefined)
                  return (
                    <span className="tag" data-status={statusValue}>
                      {sUrl
                        ? <img src={sUrl} alt={getStatusLabel(selected.progress)} className="tag__icon" />
                        : null}
                      {getStatusLabel(selected.progress)}
                    </span>
                  )
                })()}
              </div>
              {selected.rating && (
                <div className="mediapp-detail__rating">
                  <span className="mediapp-detail__stars">{ratingStars(selected.rating)}</span>
                  <span className="mediapp-detail__score">{selected.rating}/10</span>
                </div>
              )}
              {selected.completedAt && (
                <span className="mediapp-detail__date">
                  {new Date(selected.completedAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
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
                Read blog review
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
