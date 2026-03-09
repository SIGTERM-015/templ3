import type { CmsWebApp } from '../../lib/cms'
import type { DesktopApp } from '../../data/siteConfig'
import { useEffect, useMemo, useRef, useState } from 'react'
import { desktopApps } from '../../data/siteConfig'

type IconItem = {
  id: string
  glyph: string
  label: string
}

type Props = {
  openApps: string[]
  onOpen: (appId: string) => void
  webApps?: CmsWebApp[]
  onOpenWebApp?: (slug: string) => void
}

export function DesktopIcons({ openApps, onOpen, webApps = [], onOpenWebApp }: Props) {
  // Combine static desktop apps with dynamic webApps
  const orderedApps = useMemo<Array<IconItem>>(() => {
    const apps: IconItem[] = desktopApps.map((app: DesktopApp) => ({
      id: app.id,
      glyph: app.glyph,
      label: app.label,
    }))
    // Add terminal
    apps.push({ id: 'terminal', glyph: '>_', label: 'terminal' })
    // Add WebApps that should show on desktop
    const desktopWebApps = webApps
      .filter(w => w.showInDesktop !== false)
      .map(w => ({
        id: `webapp-${w.slug}`,
        glyph: w.icon || '◎',
        label: w.title.toLowerCase(),
      }))
    apps.push(...desktopWebApps)
    return apps
  }, [webApps])

  const defaultLayout = useMemo(
    () => Object.fromEntries(
      orderedApps.map((app: IconItem, index: number) => {
        const row = index % 6
        const col = Math.floor(index / 6)
        return [app.id, { x: 12 + (col * 92), y: 12 + (row * 86) }]
      })
    ) as Record<string, { x: number; y: number }>,
    [orderedApps]
  )

  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>(defaultLayout)
  const positionsRef = useRef<Record<string, { x: number; y: number }>>(defaultLayout)
  const dragRef = useRef<null | {
    id: string
    originX: number
    originY: number
    startX: number
    startY: number
    moved: boolean
  }>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('templ3-desktop-icons')
      if (!raw) return
      const parsed = JSON.parse(raw) as Record<string, { x: number; y: number }>
      const next = { ...defaultLayout, ...parsed }
      setPositions(next)
      positionsRef.current = next
    } catch {}
  }, [defaultLayout])

  useEffect(() => {
    positionsRef.current = positions
  }, [positions])

  // Handle icon click - route to appropriate handler based on app type
  const handleIconClick = (appId: string) => {
    if (appId.startsWith('webapp-') && onOpenWebApp) {
      const slug = appId.replace('webapp-', '')
      onOpenWebApp(slug)
    } else {
      onOpen(appId)
    }
  }

  return (
    <div className="desktop-icons">
      {orderedApps.map((app: IconItem) => (
        <button
          key={app.id}
          className="desktop-icon"
          data-active={openApps.includes(app.id)}
          style={{
            left: `${positions[app.id]?.x ?? 0}px`,
            top: `${positions[app.id]?.y ?? 0}px`,
          }}
          onPointerDown={(event) => {
            if (event.button !== 0) return
            const origin = positions[app.id] ?? { x: 0, y: 0 }
            const dragState = {
              id: app.id,
              originX: origin.x,
              originY: origin.y,
              startX: event.clientX,
              startY: event.clientY,
              moved: false,
            }
            dragRef.current = dragState

            const onMove = (moveEvent: PointerEvent) => {
              const current = dragRef.current
              if (!current) return
              const dx = moveEvent.clientX - current.startX
              const dy = moveEvent.clientY - current.startY
              if (Math.abs(dx) > 3 || Math.abs(dy) > 3) current.moved = true

              const maxX = Math.max(8, window.innerWidth - 90)
              const maxY = Math.max(8, window.innerHeight - 130)
              const nextX = Math.min(maxX, Math.max(8, current.originX + dx))
              const nextY = Math.min(maxY, Math.max(8, current.originY + dy))

              setPositions((prev: Record<string, { x: number; y: number }>) => ({
                ...prev,
                [current.id]: { x: nextX, y: nextY },
              }))
            }

            const onUp = () => {
              const finalDrag = dragRef.current
              dragRef.current = null
              window.removeEventListener('pointermove', onMove)
              window.removeEventListener('pointerup', onUp)
              if (!finalDrag) return
              if (!finalDrag.moved) {
                handleIconClick(finalDrag.id)
              }
              localStorage.setItem('templ3-desktop-icons', JSON.stringify(positionsRef.current))
            }

            window.addEventListener('pointermove', onMove)
            window.addEventListener('pointerup', onUp)
          }}
        >
          <span className="desktop-icon__glyph">{app.glyph}</span>
          <span className="desktop-icon__label">{app.label}</span>
        </button>
      ))}
    </div>
  )
}
