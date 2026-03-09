'use client'

import { useCallback, useEffect, useState } from 'react'
import { useField, useAllFormFields, useDocumentInfo } from '@payloadcms/ui'
import './index.scss'

type MediaLookupResult = {
  externalId: string
  source: string
  title: string
  creator?: string
  coverUrl?: string
  externalUrl?: string
  year?: number
  description?: string
}

type MediaType = {
  id: string
  value: string
  label: string
  lookupSource?: string
}

const SOURCE_LABELS: Record<string, string> = {
  igdb: 'IGDB',
  tmdb: 'TMDB',
  'anilist-anime': 'AniList',
  'anilist-manga': 'AniList',
  openlibrary: 'Open Library',
  musicbrainz: 'MusicBrainz',
}

function MediaLookupField() {
  const { value: mediaTypeId } = useField<string>({ path: 'mediaType' })
  const [_fields, dispatchFields] = useAllFormFields()
  const { id: _docId } = useDocumentInfo()

  const [lookupSource, setLookupSource] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MediaLookupResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  // Fetch media type to get lookupSource
  useEffect(() => {
    if (!mediaTypeId) {
      setLookupSource(null)
      return
    }

    fetch(`/api/media-types/${mediaTypeId}?depth=0`)
      .then((res) => res.json())
      .then((data: unknown) => {
        const mediaType = data as MediaType
        setLookupSource(mediaType.lookupSource || null)
      })
      .catch(() => {
        setLookupSource(null)
      })
  }, [mediaTypeId])

  const handleSearch = useCallback(async () => {
    if (!lookupSource || lookupSource === 'none' || !query.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch(
        `/api/media-lookup?source=${lookupSource}&q=${encodeURIComponent(query.trim())}`,
      )

      if (!res.ok) {
        const errorData = (await res.json()) as { error?: string }
        throw new Error(errorData.error || 'Search failed')
      }

      const data = (await res.json()) as { results?: MediaLookupResult[] }
      setResults(data.results || [])
      setIsOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [lookupSource, query])

  const handleSelect = useCallback(
    (result: MediaLookupResult) => {
      // Update title
      dispatchFields({
        type: 'UPDATE',
        path: 'title',
        value: result.title,
      })

      // Update creator if present
      if (result.creator) {
        dispatchFields({
          type: 'UPDATE',
          path: 'creator',
          value: result.creator,
        })
      }

      // Update external cover URL if present
      if (result.coverUrl) {
        dispatchFields({
          type: 'UPDATE',
          path: 'externalCoverUrl',
          value: result.coverUrl,
        })
      }

      // Update external ID
      dispatchFields({
        type: 'UPDATE',
        path: 'externalId',
        value: result.externalId,
      })

      // Update external source
      dispatchFields({
        type: 'UPDATE',
        path: 'externalSource',
        value: result.source,
      })

      // Update external URL if present
      if (result.externalUrl) {
        dispatchFields({
          type: 'UPDATE',
          path: 'externalUrl',
          value: result.externalUrl,
        })
      }

      // Close dropdown and clear search
      setIsOpen(false)
      setQuery('')
      setResults([])
    },
    [dispatchFields],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleSearch()
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    },
    [handleSearch],
  )

  // Don't render if no lookup source configured
  if (!lookupSource || lookupSource === 'none') {
    return null
  }

  const sourceLabel = SOURCE_LABELS[lookupSource] || lookupSource

  return (
    <div className="media-lookup-field">
      <label className="media-lookup-field__label">
        Search {sourceLabel}
      </label>
      <p className="media-lookup-field__description">
        Search for media to auto-fill title, creator, and cover image
      </p>

      <div className="media-lookup-field__search">
        <input
          type="text"
          className="media-lookup-field__input"
          placeholder={`Search ${sourceLabel}...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          className="media-lookup-field__button"
          onClick={handleSearch}
          disabled={loading || !query.trim()}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <p className="media-lookup-field__error">{error}</p>}

      {isOpen && results.length > 0 && (
        <div className="media-lookup-field__results">
          {results.map((result) => (
            <button
              key={`${result.source}-${result.externalId}`}
              type="button"
              className="media-lookup-field__result"
              onClick={() => handleSelect(result)}
            >
              {result.coverUrl ? (
                <img
                  src={result.coverUrl}
                  alt={result.title}
                  className="media-lookup-field__cover"
                  onError={(e) => {
                    // Hide broken images
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              ) : (
                <div className="media-lookup-field__cover media-lookup-field__cover--empty">
                  ?
                </div>
              )}
              <div className="media-lookup-field__info">
                <span className="media-lookup-field__title">
                  {result.title}
                  {result.year && (
                    <span className="media-lookup-field__year"> ({result.year})</span>
                  )}
                </span>
                {result.creator && (
                  <span className="media-lookup-field__creator">{result.creator}</span>
                )}
                {result.description && (
                  <span className="media-lookup-field__desc">
                    {result.description.slice(0, 100)}...
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && results.length === 0 && !loading && !error && (
        <p className="media-lookup-field__empty">No results found</p>
      )}
    </div>
  )
}

export default MediaLookupField
