import { memo, useCallback, useRef, useState, type ReactNode } from 'react'

type Props = {
  id: string
  title: string
  icon: string
  x: number
  y: number
  w: number
  h: number
  zIndex: number
  maximized: boolean
  noPadding?: boolean
  onFocus: (id: string) => void
  onClose: (id: string) => void
  onMinimize: (id: string) => void
  onMaximize: (id: string) => void
  onMove: (id: string, x: number, y: number) => void
  onResize: (id: string, w: number, h: number) => void
  children: ReactNode
}

const WindowFrameInner = ({
  id, title, icon, x, y, w, h, zIndex, maximized, noPadding,
  onFocus, onClose, onMinimize, onMaximize, onMove, onResize,
  children,
}: Props) => {
  const frameRef = useRef<HTMLDivElement>(null)
  const [interacting, setInteracting] = useState(false)

  // Drag: direct DOM manipulation during mousemove, single React dispatch on mouseup
  const handleTitleMouseDown = useCallback((e: React.MouseEvent) => {
    if (maximized || e.button !== 0) return
    e.preventDefault()
    onFocus(id)
    setInteracting(true)

    const parent = frameRef.current?.parentElement
    const frame = frameRef.current
    if (!parent || !frame) return
    const pr = parent.getBoundingClientRect()

    const startX = e.clientX
    const startY = e.clientY

    // Read current position from DOM to avoid depending on x/y props
    const frameRect = frame.getBoundingClientRect()
    const startLeft = ((frameRect.left - pr.left) / pr.width) * 100
    const startTop = ((frameRect.top - pr.top) / pr.height) * 100

    let finalX = startLeft
    let finalY = startTop

    const move = (ev: MouseEvent) => {
      const deltaX = ((ev.clientX - startX) / pr.width) * 100
      const deltaY = ((ev.clientY - startY) / pr.height) * 100
      finalX = Math.max(-5, Math.min(85, startLeft + deltaX))
      finalY = Math.max(0, Math.min(85, startTop + deltaY))

      // Direct DOM — zero React re-renders during drag
      frame.style.left = `${finalX}%`
      frame.style.top = `${finalY}%`
    }

    const up = () => {
      setInteracting(false)
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseup', up)
      // Single dispatch at the end
      onMove(id, finalX, finalY)
    }

    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', up)
  }, [maximized, id, onFocus, onMove])

  // Resize: direct DOM manipulation during mousemove, single React dispatch on mouseup
  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    if (maximized || e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    setInteracting(true)

    const parent = frameRef.current?.parentElement
    const frame = frameRef.current
    if (!parent || !frame) return
    const pr = parent.getBoundingClientRect()

    // Read current size from DOM to avoid depending on w/h props
    const frameRect = frame.getBoundingClientRect()
    let finalW = (frameRect.width / pr.width) * 100
    let finalH = (frameRect.height / pr.height) * 100

    const move = (ev: MouseEvent) => {
      const fr = frame.getBoundingClientRect()
      finalW = Math.max(25, Math.min(95, ((ev.clientX - fr.left) / pr.width) * 100))
      finalH = Math.max(20, Math.min(95, ((ev.clientY - fr.top) / pr.height) * 100))

      // Direct DOM — zero React re-renders during resize
      frame.style.width = `${finalW}%`
      frame.style.height = `${finalH}%`
    }

    const up = () => {
      setInteracting(false)
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseup', up)
      // Single dispatch at the end
      onResize(id, finalW, finalH)
    }

    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', up)
  }, [maximized, id, onResize])

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
      onMouseDown={() => onFocus(id)}
    >
      <div
        className="window-titlebar"
        data-draggable={!maximized}
        onMouseDown={handleTitleMouseDown}
        onDoubleClick={() => onMaximize(id)}
      >
        <span className="window-title">{icon} {title}</span>
        <div className="window-controls">
          <button className="window-btn" onClick={(e) => { e.stopPropagation(); onMinimize(id) }} aria-label="Minimize">_</button>
          <button className="window-btn" onClick={(e) => { e.stopPropagation(); onMaximize(id) }} aria-label="Maximize">□</button>
          <button className="window-btn" data-action="close" onClick={(e) => { e.stopPropagation(); onClose(id) }} aria-label="Close">✕</button>
        </div>
      </div>
      <div className="window-content" style={noPadding ? { padding: 0 } : undefined}>
        {children}
      </div>
      <div className="window-resize-handle" onMouseDown={handleResizeMouseDown} />
    </div>
  )
}

export const WindowFrame = memo(WindowFrameInner)
