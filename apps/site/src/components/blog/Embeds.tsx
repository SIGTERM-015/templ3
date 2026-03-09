import './embeds.css'

// ─── YouTube ────────────────────────────────────────────────────────────────

type YouTubeProps = {
  url: string
  caption?: string
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function YouTubeEmbed({ url, caption }: YouTubeProps) {
  const videoId = extractYouTubeId(url)
  if (!videoId) return <p className="embed-error">Invalid YouTube URL</p>

  return (
    <figure className="embed embed--youtube">
      <div className="embed__wrapper">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

// ─── Spotify ────────────────────────────────────────────────────────────────

type SpotifyProps = {
  url: string
  height?: 'compact' | 'large'
}

function extractSpotifyUri(url: string): string | null {
  // https://open.spotify.com/track/xxx -> spotify:track:xxx
  const match = url.match(/open\.spotify\.com\/(track|album|playlist|episode|show)\/([^?]+)/)
  if (match) return `${match[1]}/${match[2]}`
  return null
}

export function SpotifyEmbed({ url, height = 'compact' }: SpotifyProps) {
  const uri = extractSpotifyUri(url)
  if (!uri) return <p className="embed-error">Invalid Spotify URL</p>

  const h = height === 'large' ? 352 : 152

  return (
    <figure className="embed embed--spotify">
      <iframe
        src={`https://open.spotify.com/embed/${uri}?utm_source=generator&theme=0`}
        width="100%"
        height={h}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        style={{ borderRadius: 12, border: 0 }}
      />
    </figure>
  )
}

// ─── Twitter/X ──────────────────────────────────────────────────────────────

type TwitterProps = {
  url: string
}

export function TwitterEmbed({ url }: TwitterProps) {
  // Twitter embeds require their widget script, we'll use a simple blockquote fallback
  // that can be enhanced client-side
  return (
    <figure className="embed embed--twitter">
      <blockquote className="twitter-tweet" data-theme="dark">
        <a href={url}>{url}</a>
      </blockquote>
    </figure>
  )
}

// ─── GitHub Gist ────────────────────────────────────────────────────────────

type GistProps = {
  url: string
}

function extractGistId(url: string): { user: string; id: string } | null {
  const match = url.match(/gist\.github\.com\/([^/]+)\/([^/?\s]+)/)
  if (match) return { user: match[1], id: match[2] }
  return null
}

export function GitHubGistEmbed({ url }: GistProps) {
  const gist = extractGistId(url)
  if (!gist) return <p className="embed-error">Invalid Gist URL</p>

  return (
    <figure className="embed embed--gist">
      <iframe
        src={`https://gist.github.com/${gist.user}/${gist.id}.pibb`}
        style={{ width: '100%', border: 0, minHeight: 200 }}
      />
    </figure>
  )
}

// ─── CodePen ────────────────────────────────────────────────────────────────

type CodePenProps = {
  url: string
  height?: number
  defaultTab?: 'result' | 'html' | 'css' | 'js'
}

function extractCodePenId(url: string): { user: string; id: string } | null {
  const match = url.match(/codepen\.io\/([^/]+)\/(?:pen|full|details)\/([^/?]+)/)
  if (match) return { user: match[1], id: match[2] }
  return null
}

export function CodePenEmbed({ url, height = 400, defaultTab = 'result' }: CodePenProps) {
  const pen = extractCodePenId(url)
  if (!pen) return <p className="embed-error">Invalid CodePen URL</p>

  return (
    <figure className="embed embed--codepen">
      <iframe
        height={height}
        style={{ width: '100%', border: 0 }}
        scrolling="no"
        src={`https://codepen.io/${pen.user}/embed/${pen.id}?default-tab=${defaultTab}&theme-id=dark`}
        loading="lazy"
        allowFullScreen
      />
    </figure>
  )
}

// ─── Video ──────────────────────────────────────────────────────────────────

type VideoProps = {
  url: string
  caption?: string
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
}

export function VideoEmbed({ url, caption, autoplay, loop, muted = true }: VideoProps) {
  return (
    <figure className="embed embed--video">
      <video
        src={url}
        controls
        autoPlay={autoplay}
        loop={loop}
        muted={muted}
        playsInline
      />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

// ─── Callout ────────────────────────────────────────────────────────────────

type CalloutProps = {
  type: 'info' | 'warning' | 'error' | 'success' | 'tip'
  title?: string
  content: string
}

const calloutIcons: Record<string, string> = {
  info: 'ℹ️',
  warning: '⚠️',
  error: '❌',
  success: '✅',
  tip: '💡',
}

export function CalloutBlock({ type, title, content }: CalloutProps) {
  return (
    <aside className={`callout callout--${type}`}>
      <span className="callout__icon">{calloutIcons[type] || 'ℹ️'}</span>
      <div className="callout__content">
        {title && <strong className="callout__title">{title}</strong>}
        <p>{content}</p>
      </div>
    </aside>
  )
}

// ─── Divider ────────────────────────────────────────────────────────────────

type DividerProps = {
  style?: 'line' | 'dots' | 'stars' | 'space'
}

const dividerChars: Record<string, string> = {
  line: '───────────',
  dots: '• • •',
  stars: '✦ ✦ ✦',
  space: '',
}

export function DividerBlock({ style = 'line' }: DividerProps) {
  return (
    <hr className={`divider divider--${style}`} data-content={dividerChars[style]} />
  )
}

// ─── Bookmark ───────────────────────────────────────────────────────────────

type BookmarkProps = {
  url: string
  title?: string
  description?: string
  thumbnail?: { url?: string } | string | null
}

export function BookmarkCard({ url, title, description, thumbnail }: BookmarkProps) {
  const thumbUrl = typeof thumbnail === 'object' && thumbnail?.url ? thumbnail.url : undefined

  return (
    <a href={url} className="bookmark" target="_blank" rel="noopener noreferrer">
      <div className="bookmark__content">
        <span className="bookmark__title">{title || url}</span>
        {description && <span className="bookmark__description">{description}</span>}
        <span className="bookmark__url">{new URL(url).hostname}</span>
      </div>
      {thumbUrl && (
        <div className="bookmark__thumbnail">
          <img src={thumbUrl} alt="" loading="lazy" />
        </div>
      )}
    </a>
  )
}
