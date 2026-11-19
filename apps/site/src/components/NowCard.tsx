export type NowCardProps = {
  cover?: string
  title: string
  subtitle?: string
  href?: string
  onClick?: () => void
  isPlaying?: boolean
}

export function NowCard({ cover, title, subtitle, href, onClick, isPlaying }: NowCardProps) {
  const content = (
    <>
      <div
        className="now-card__cover"
        style={cover ? { backgroundImage: `url(${cover})` } : undefined}
      >
        {!cover && <span className="now-card__placeholder">?</span>}
        {isPlaying && (
          <div className="now-card__bars" aria-hidden="true">
            <span className="now-card__bar" />
            <span className="now-card__bar" />
            <span className="now-card__bar" />
          </div>
        )}
      </div>
      <span className="now-card__title">{title}</span>
      {subtitle && <span className="now-card__subtitle">{subtitle}</span>}
    </>
  )

  if (href) {
    return (
      <a className="now-card" href={href} target="_blank" rel="noopener noreferrer">
        {content}
      </a>
    )
  }

  return (
    <button type="button" className="now-card" onClick={onClick}>
      {content}
    </button>
  )
}
