import { useEffect, useState } from 'react'
import type { CmsNote } from '../../../lib/cms'

type Props = {
  serverData?: Record<string, unknown>
  onOpenNote?: (note: CmsNote) => void
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return ''
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

function formatSize(content: string | undefined): string {
  if (!content) return '0 B'
  const bytes = new TextEncoder().encode(content).length
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

export function NotesApp({ serverData, onOpenNote }: Props) {
  const initialNotes = (serverData?.notes as CmsNote[]) ?? []
  const [notes, setNotes] = useState<CmsNote[]>(initialNotes)
  const [loading, setLoading] = useState(!initialNotes.length)
  const [selected, setSelected] = useState<CmsNote | null>(null)

  useEffect(() => {
    if (initialNotes.length > 0) return
    fetch('/api/notes.json')
      .then(r => r.json() as Promise<CmsNote[]>)
      .then(data => setNotes(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSingleClick = (note: CmsNote) => {
    setSelected(note)
  }

  const handleDoubleClick = (note: CmsNote) => {
    onOpenNote?.(note)
  }

  const handleKeyDown = (e: React.KeyboardEvent, note: CmsNote) => {
    if (e.key === 'Enter') onOpenNote?.(note)
  }

  return (
    <div className="notes-explorer">
      {/* Toolbar */}
      <div className="notes-explorer__toolbar">
        <div className="notes-explorer__path">
          <span className="notes-explorer__path-root">~</span>
          <span className="notes-explorer__path-sep">/</span>
          <span className="notes-explorer__path-seg">notes</span>
        </div>
        <span className="notes-explorer__count">
          {loading ? '...' : `${notes.length} file${notes.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Column headers */}
      <div className="notes-explorer__cols">
        <span className="notes-explorer__col-name">Name</span>
        <span className="notes-explorer__col-date">Modified</span>
        <span className="notes-explorer__col-size">Size</span>
      </div>

      {/* File list */}
      <div className="notes-explorer__list" role="listbox" aria-label="Notes files">
        {loading && (
          <div className="notes-explorer__empty">Loading...</div>
        )}

        {!loading && notes.length === 0 && (
          <div className="notes-explorer__empty">No files found</div>
        )}

        {notes.map((note: CmsNote) => {
          const filename = note.filename || `${note.slug}.md`
          const isSelected = selected?.id === note.id
          return (
            <div
              key={note.id}
              className={`notes-explorer__item${isSelected ? ' notes-explorer__item--selected' : ''}`}
              role="option"
              aria-selected={isSelected}
              tabIndex={0}
              onClick={() => handleSingleClick(note)}
              onDoubleClick={() => handleDoubleClick(note)}
              onKeyDown={e => handleKeyDown(e, note)}
            >
              <span className="notes-explorer__item-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="1" width="9" height="13" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M11 1l3 3v10a1 1 0 01-1 1H3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  <path d="M11 1v3h3" stroke="currentColor" strokeWidth="1.2"/>
                  <line x1="5" y1="6" x2="9" y2="6" stroke="currentColor" strokeWidth="1"/>
                  <line x1="5" y1="8.5" x2="9" y2="8.5" stroke="currentColor" strokeWidth="1"/>
                  <line x1="5" y1="11" x2="7.5" y2="11" stroke="currentColor" strokeWidth="1"/>
                </svg>
              </span>
              <span className="notes-explorer__item-name" title={filename}>{filename}</span>
              <span className="notes-explorer__item-date">{formatDate(note.publishedAt)}</span>
              <span className="notes-explorer__item-size">{formatSize(note.content)}</span>
            </div>
          )
        })}
      </div>

      {/* Status bar */}
      <div className="notes-explorer__statusbar">
        {selected
          ? `${selected.filename || selected.slug + '.md'} — double-click to open`
          : 'Double-click a file to open it'}
      </div>
    </div>
  )
}
