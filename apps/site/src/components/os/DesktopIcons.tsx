import { desktopApps } from '../../data/siteConfig'

type Props = {
  openApps: string[]
  onOpen: (appId: string) => void
}

export function DesktopIcons({ openApps, onOpen }: Props) {
  return (
    <div className="desktop-icons">
      {desktopApps.map(app => (
        <button
          key={app.id}
          className="desktop-icon"
          data-active={openApps.includes(app.id)}
          onClick={() => onOpen(app.id)}
        >
          <span className="desktop-icon__glyph">{app.glyph}</span>
          <span className="desktop-icon__label">{app.label}</span>
        </button>
      ))}
      <button
        className="desktop-icon"
        data-active={openApps.includes('terminal')}
        onClick={() => onOpen('terminal')}
      >
        <span className="desktop-icon__glyph">&gt;_</span>
        <span className="desktop-icon__label">terminal</span>
      </button>
    </div>
  )
}
