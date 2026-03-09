import { useEffect, useState } from 'react'
import { site } from '../../data/siteConfig'

type WindowInfo = {
  id: string
  title: string
  icon: string
  minimized: boolean
}

type Props = {
  windows: WindowInfo[]
  focusedId?: string
  onFocusWindow: (id: string) => void
  onOpenTerminal: () => void
  onToggleMenu?: () => void
}

export function TaskbarReact({ windows, focusedId, onFocusWindow, onOpenTerminal, onToggleMenu }: Props) {
  const [clock, setClock] = useState('')

  useEffect(() => {
    const tick = () => {
      const d = new Date()
      const h = d.getUTCHours().toString().padStart(2, '0')
      const m = d.getUTCMinutes().toString().padStart(2, '0')
      setClock(`${h}:${m} UTC`)
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="taskbar">
      <div className="taskbar-start">
        <button className="taskbar-start-btn" onClick={onToggleMenu} type="button">
          <img src="/sigterm-logo.svg" alt="" className="taskbar-logo" />
          {site.name}
        </button>
      </div>
      <div className="taskbar-apps">
        {windows.map(w => (
          <button
            key={w.id}
            className={'taskbar-app' + (w.id === focusedId ? ' taskbar-app--focused' : '')}
            style={{ opacity: w.minimized ? 0.5 : 1 }}
            onClick={() => onFocusWindow(w.id)}
          >
            {w.icon} {w.title}
          </button>
        ))}
      </div>
      <div className="taskbar-tray">
        <button className="taskbar-terminal-btn" onClick={onOpenTerminal} aria-label="Terminal">&gt;_</button>
        <span className="taskbar-clock">{clock}</span>
      </div>
    </div>
  )
}
