import { useCallback, useRef, useState } from 'react'
import { SignInButton } from '@clerk/astro/react'
import { useStore } from '@nanostores/react'
import { $userStore, $clerkStore } from '@clerk/astro/client'
import '@excalidraw/excalidraw/index.css'

type ExcalidrawAPIRef = {
  getSceneElements: () => unknown[]
  getAppState: () => Record<string, unknown>
  getFiles: () => Record<string, unknown>
}

type Props = {
  onSubmitted?: () => void
}

/** Detect embed type from URL */
function detectEmbedType(url: string): 'spotify' | 'youtube' | 'none' {
  if (url.includes('spotify.com') || url.includes('spotify:')) return 'spotify'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  return 'none'
}

function ExcalidrawCanvas({ excalidrawRef }: { excalidrawRef: React.MutableRefObject<ExcalidrawAPIRef | null> }) {
  const [Comp, setComp] = useState<React.ComponentType<Record<string, unknown>> | null>(null)

  // Lazy-load Excalidraw (it's heavy and uses browser APIs)
  useState(() => {
    import('@excalidraw/excalidraw').then((mod) => {
      setComp(() => mod.Excalidraw)
    }).catch(() => {})
  })

  if (!Comp) {
    return (
      <div className="gb-editor__canvas-loading">
        Loading canvas...
      </div>
    )
  }

  return (
    <div className="gb-editor__canvas">
      <Comp
        theme="dark"
        initialData={{
          appState: {
            viewBackgroundColor: '#1a1a1a',
            currentItemStrokeColor: '#e0d5c0',
            currentItemFontFamily: 3,
          },
        }}
        excalidrawAPI={(api: unknown) => {
          excalidrawRef.current = api as ExcalidrawAPIRef
        }}
        UIOptions={{
          canvasActions: {
            loadScene: false,
            saveToActiveFile: false,
            toggleTheme: false,
          },
        }}
      />
    </div>
  )
}

export function GuestbookEditorApp({ onSubmitted }: Props) {
  const user = useStore($userStore)
  const clerk = useStore($clerkStore)
  
  const authLoaded = user !== undefined && clerk !== undefined
  const isSignedIn = user !== null

  const excalidrawRef = useRef<ExcalidrawAPIRef | null>(null)
  const [message, setMessage] = useState('')
  const [embedUrl, setEmbedUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = useCallback(async () => {
    if (!excalidrawRef.current || !user) return

    if (!message.trim()) {
      setError('Please write a title for your entry.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // Lazy load exportToBlob to avoid SSR issues with Excalidraw
      const { exportToBlob } = await import('@excalidraw/excalidraw')

      // Export canvas as PNG
      const elements = excalidrawRef.current.getSceneElements()
      const appState = excalidrawRef.current.getAppState()
      const files = excalidrawRef.current.getFiles()

      const blob = await exportToBlob({
        elements,
        appState: { ...appState, exportWithDarkMode: true, exportBackground: true },
        files,
        mimeType: 'image/png',
        exportPadding: 16,
      })

      // Gather Discord info from Clerk user
      const discordAccount = user.externalAccounts?.find(
        (acc) => acc.provider === 'discord' || acc.provider === 'oauth_discord'
      )

      const authorName = user.username
        || discordAccount?.username
        || user.fullName
        || 'Anonymous'

      const authorAvatar = user.imageUrl || undefined
      const authorDiscordId = discordAccount?.providerUserId || undefined

      // Build form data
      const formData = new FormData()
      formData.append('image', blob, 'guestbook-entry.png')
      formData.append('authorName', authorName)
      if (authorAvatar) formData.append('authorAvatar', authorAvatar)
      if (authorDiscordId) formData.append('authorDiscordId', authorDiscordId)
      formData.append('clerkUserId', user.id)
      if (message.trim()) formData.append('message', message.trim())
      if (embedUrl.trim()) formData.append('embedUrl', embedUrl.trim())

      const res = await fetch('/api/guestbook.json', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(data.error || 'Failed to submit entry')
      }

      setSuccess(true)
      onSubmitted?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }, [user, message, embedUrl, onSubmitted])

  // Loading state
  if (!authLoaded) {
    return (
      <div className="gb-editor">
        <div className="gb-editor__loading">Initializing...</div>
      </div>
    )
  }

  // Not signed in — show Discord login
  if (!isSignedIn) {
    return (
      <div className="gb-editor">
        <div className="gb-editor__auth">
          <div className="gb-editor__auth-icon">✎</div>
          <h2 className="gb-editor__auth-title">Sign the Guestbook</h2>
          <p className="gb-editor__auth-desc">
            Connect with Discord to leave your mark.
            <br />
            Your username and avatar will be shown alongside your entry.
          </p>
          <SignInButton mode="modal" forceRedirectUrl="/guestbook?editor=true">
            <button className="gb-editor__discord-btn" type="button">
              <svg width="20" height="15" viewBox="0 0 71 55" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M60.1 4.9A58.6 58.6 0 0045.4.2a.2.2 0 00-.2.1 40.8 40.8 0 00-1.8 3.7 54.1 54.1 0 00-16.2 0A37.4 37.4 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 5a.2.2 0 00-.1.1C1.5 18.7-.9 32 .3 45.1v.1a58.9 58.9 0 0017.7 9 .2.2 0 00.3-.1 42.1 42.1 0 003.6-5.9.2.2 0 00-.1-.3 38.8 38.8 0 01-5.5-2.7.2.2 0 01 0-.4l1.1-.9a.2.2 0 01.2 0 42 42 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .4c-1.8 1-3.6 1.9-5.5 2.7a.2.2 0 00-.1.3 47.3 47.3 0 003.6 5.9.2.2 0 00.3.1A58.7 58.7 0 0070.3 45.2v-.1c1.4-15-2.3-28-9.8-39.6a.2.2 0 00-.1-.1zM23.7 37c-3.4 0-6.3-3.2-6.3-7s2.8-7 6.3-7 6.3 3.1 6.3 7-2.8 7-6.3 7zm23.2 0c-3.4 0-6.3-3.2-6.3-7s2.8-7 6.3-7 6.3 3.1 6.3 7-2.8 7-6.3 7z"/>
              </svg>
              Connect with Discord
            </button>
          </SignInButton>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="gb-editor">
        <div className="gb-editor__success">
          <div className="gb-editor__success-icon">✓</div>
          <h2 className="gb-editor__success-title">Entry Submitted!</h2>
          <p className="gb-editor__success-desc">
            Your guestbook entry has been submitted for review.
            <br />
            It will appear on the board once approved.
          </p>
        </div>
      </div>
    )
  }

  // Embed URL validation hint
  const embedType = embedUrl.trim() ? detectEmbedType(embedUrl.trim()) : 'none'

  return (
    <div className="gb-editor">
      {/* Toolbar */}
      <div className="gb-editor__toolbar">
        <div className="gb-editor__toolbar-left">
          <span className="gb-editor__toolbar-user">
            {user.imageUrl && (
              <img
                className="gb-editor__toolbar-avatar"
                src={user.imageUrl}
                alt=""
                width={18}
                height={18}
              />
            )}
            {user.username || user.fullName || 'Anonymous'}
          </span>
          <span className="gb-editor__toolbar-hint" style={{ fontSize: '10px', color: 'var(--faded)', marginLeft: '8px' }}>
            [Tip: Press '9' or the image icon to upload images]
          </span>
        </div>
        <button
          className="gb-editor__submit-btn"
          onClick={handleSubmit}
          disabled={submitting}
          type="button"
        >
          {submitting ? 'Submitting...' : 'Submit Entry'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="gb-editor__error">{error}</div>
      )}

      {/* Excalidraw Canvas */}
      <ExcalidrawCanvas excalidrawRef={excalidrawRef} />

      {/* Bottom fields */}
      <div className="gb-editor__fields">
        <div className="gb-editor__field">
          <label className="gb-editor__label" htmlFor="gb-message">Title</label>
          <input
            id="gb-message"
            className="gb-editor__input"
            type="text"
            placeholder="Write a title for your entry..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={60}
          />
        </div>
        <div className="gb-editor__field">
          <label className="gb-editor__label" htmlFor="gb-embed">
            Embed URL (optional) it will be displayed alongside your entry
            {embedType !== 'none' && (
              <span className="gb-editor__embed-badge">
                {embedType === 'spotify' ? '♪ Spotify' : '▶ YouTube'}
              </span>
            )}
          </label>
          <input
            id="gb-embed"
            className="gb-editor__input"
            type="url"
            placeholder="Paste a Spotify or YouTube URL..."
            value={embedUrl}
            onChange={(e) => setEmbedUrl(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
