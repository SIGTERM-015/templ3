import { useMemo } from 'react'
import { marked } from 'marked'
import type { CmsNote } from '../../../lib/cms'

marked.setOptions({ async: false })

type Props = {
  note: CmsNote
}

function parseMarkdown(content: string): string {
  try {
    return marked.parse(content, { async: false }) as string
  } catch {
    return content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }
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

export function NoteViewerApp({ note }: Props) {
  const html = useMemo(() => parseMarkdown(note.content ?? ''), [note.content])

  return (
    <div className="note-viewer">
      <div className="note-viewer__header">
        <span className="note-viewer__filename">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px', opacity: 0.6 }}>
            <rect x="2" y="1" width="9" height="13" rx="1" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M11 1l3 3v10a1 1 0 01-1 1H3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M11 1v3h3" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
          {note.filename || `${note.slug}.md`}
        </span>
        {note.publishedAt && (
          <span className="note-viewer__date">{formatDate(note.publishedAt)}</span>
        )}
      </div>
      <div
        className="note-viewer__body markdown-body"
        // marked output comes from our own CMS — trusted source
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
