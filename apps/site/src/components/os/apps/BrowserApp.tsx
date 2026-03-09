import { useState } from 'react'

type Props = {
  url: string
  title: string
  showAddressBar?: boolean
}

export function BrowserApp({ url, title, showAddressBar = true }: Props) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  return (
    <div className="browser-app">
      {showAddressBar && (
        <div className="browser-app__toolbar">
          <div className="browser-app__nav">
            <button className="browser-app__nav-btn" disabled title="Back">←</button>
            <button className="browser-app__nav-btn" disabled title="Forward">→</button>
            <button
              className="browser-app__nav-btn"
              onClick={() => {
                setLoading(true)
                setError(false)
                const iframe = document.querySelector(`iframe[data-browser-url="${url}"]`) as HTMLIFrameElement
                if (iframe) iframe.src = url
              }}
              title="Reload"
            >
              ↻
            </button>
          </div>
          <div className="browser-app__address">
            <span className="browser-app__lock">🔒</span>
            <span className="browser-app__url">{url}</span>
          </div>
        </div>
      )}
      <div className="browser-app__content">
        {loading && !error && (
          <div className="browser-app__loading">
            <span className="browser-app__spinner">◠</span>
            Loading {title}...
          </div>
        )}
        {error && (
          <div className="browser-app__error">
            <span className="browser-app__error-icon">⚠</span>
            <p>Failed to load {url}</p>
            <p className="browser-app__error-hint">
              This site may not allow embedding in iframes.
            </p>
          </div>
        )}
        <iframe
          data-browser-url={url}
          src={url}
          title={title}
          className="browser-app__iframe"
          style={{ opacity: loading || error ? 0 : 1 }}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false)
            setError(true)
          }}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  )
}
