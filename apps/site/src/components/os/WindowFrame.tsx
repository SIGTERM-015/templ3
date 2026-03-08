import { useCallback, useRef, useState, type ReactNode } from 'react'

type Props = {
  title: string
  icon: string
  x: number
  y: number
  w: number
  h: number
  zIndex: number
  maximized: boolean
  noPadding?: boolean
  onFocus: () => void
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onMove: (x: number, y: number) => void
  onResize: (w: number, h: number) => void
  children: ReactNode
}

export function WindowFrame({
  title, icon, x, y, w, h, zIndex, maximized, noPadding,
  onFocus, onClose, onMinimize, onMaximize, onMove, onResize,
  children,
}: Props) {
  const frameRef = useRef<HTMLDivElement>(null)
  const [interacting, setInteracting] = useState(false)

  const handleTitleMouseDown = useCallback((e: React.MouseEvent) => {
    if (maximized || e.button !== 0) return
    e.preventDefault()
    onFocus()
    setInteracting(true)

    const parent = frameRef.current?.parentElement
    if (!parent) return
    const pr = parent.getBoundingClientRect()
    const fr = frameRef.current!.getBoundingClientRect()
    const ox = e.clientX - fr.left
    const oy = e.clientY - fr.top

    const move = (ev: MouseEvent) => {
      const nx = ((ev.clientX - ox - pr.left) / pr.width) * 100
      const ny = ((ev.clientY - oy - pr.top) / pr.height) * 100
      onMove(Math.max(-5, Math.min(85, nx)), Math.max(0, Math.min(85, ny)))
    }

    const up = () => {
      setInteracting(false)
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseup', up)
    }

    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', up)
  }, [maximized, onFocus, onMove])

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    if (maximized || e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    setInteracting(true)

    const parent = frameRef.current?.parentElement
    if (!parent) return
    const pr = parent.getBoundingClientRect()

    const move = (ev: MouseEvent) => {
      const fr = frameRef.current!.getBoundingClientRect()
      const nw = ((ev.clientX - fr.left) / pr.width) * 100
      const nh = ((ev.clientY - fr.top) / pr.height) * 100
      onResize(Math.max(25, Math.min(95, nw)), Math.max(20, Math.min(95, nh)))
    }

    const up = () => {
      setInteracting(false)
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseup', up)
    }

    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', up)
  }, [maximized, onResize])

  const style: React.CSSProperties = maximized
    ? { zIndex }
    : {
        top: `${y}%`,
        left: `${x}%`,
        width: `${w}%`,
        height: `${h}%`,
        zIndex,
        ...(interacting ? { transition: 'none' } : {}),
      }

  return (
    <div
      ref={frameRef}
      className="app-window"
      data-maximized={maximized}
      style={style}
      onMouseDown={onFocus}
    >
      <div
        className="window-titlebar"
        data-draggable={!maximized}
        onMouseDown={handleTitleMouseDown}
        onDoubleClick={onMaximize}
      >
        <span className="window-title">{icon} {title}</span>
        <div className="window-controls">
          <button className="window-btn" onClick={(e) => { e.stopPropagation(); onMinimize() }} aria-label="Minimize">_</button>
          <button className="window-btn" onClick={(e) => { e.stopPropagation(); onMaximize() }} aria-label="Maximize">□</button>
          <button className="window-btn" data-action="close" onClick={(e) => { e.stopPropagation(); onClose() }} aria-label="Close">✕</button>
        </div>
      </div>
      <div className="window-content" style={noPadding ? { padding: 0 } : undefined}>
        {children}
      </div>
      <div className="window-resize-handle" onMouseDown={handleResizeMouseDown} />
    </div>
  )
}
