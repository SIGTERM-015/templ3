import type { CmsWebApp } from '../../lib/cms'
import { desktopApps, site } from '../../data/siteConfig'
import type { AppId } from './DesktopShell'

type Props = {
  isOpen: boolean
  onClose: () => void
  onOpenApp: (appId: AppId) => void
  webApps?: CmsWebApp[]
  onOpenWebApp?: (slug: string) => void
}

export function AppMenu({ isOpen, onClose, onOpenApp, webApps = [], onOpenWebApp }: Props) {
  if (!isOpen) return null

  const handleAppClick = (appId: string) => {
    onOpenApp(appId as AppId)
    onClose()
  }

  const handleWebAppClick = (slug: string) => {
    if (onOpenWebApp) {
      onOpenWebApp(slug)
      onClose()
    }
  }

  // Filter webApps that should show in menu
  const menuWebApps = webApps.filter(w => w.showInMenu !== false)

  return (
    <>
      <div className="app-menu-backdrop" onClick={onClose} />
      <div className="app-menu">
        <div className="app-menu__header">
          <img src="/sigterm-logo.svg" alt="" className="app-menu__logo" />
          <span className="app-menu__title">{site.name}</span>
        </div>
        <div className="app-menu__divider" />
        <div className="app-menu__apps">
          {desktopApps.map(app => (
            <button
              key={app.id}
              className="app-menu__app"
              onClick={() => handleAppClick(app.id)}
            >
              <span className="app-menu__app-icon">{app.glyph}</span>
              <span className="app-menu__app-label">{app.label}</span>
            </button>
          ))}
          <button
            className="app-menu__app"
            onClick={() => handleAppClick('terminal')}
          >
            <span className="app-menu__app-icon">&gt;_</span>
            <span className="app-menu__app-label">terminal</span>
          </button>
          {menuWebApps.length > 0 && (
            <>
              <div className="app-menu__divider" />
              {menuWebApps.map(webApp => (
                <button
                  key={webApp.slug}
                  className="app-menu__app"
                  onClick={() => handleWebAppClick(webApp.slug)}
                >
                  <span className="app-menu__app-icon">{webApp.icon || '◎'}</span>
                  <span className="app-menu__app-label">{webApp.title.toLowerCase()}</span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  )
}
