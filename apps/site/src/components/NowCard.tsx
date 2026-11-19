export type NowCardProps = {
  cover?: string
  title: string
  subtitle?: string
  href?: string
  onClick?: () => void
}

export function NowCard({ cover, title, subtitle, href, onClick }: NowCardProps) {
  const content = (
    <>
      <div
        className="now-card__cover"
        style={cover ? { backgroundImage: `url(${cover})` } : undefined}
      >
        {!cover && <span className="now-card__placeholder">?</span>}
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
