import { useEffect, useState } from 'react'

const BOOT_LINES = [
  'TEMPL3',
  'Copyright (C) Sigterm Industries',
  '',
  'Checking memory... 640K OK',
  'Detecting hardware...',
  '  CPU: Soviet Neural Core i9-2077',
  '  GPU: AMBER-CRT Phosphor Adapter',
  '  NET: Ghost Protocol v3.14',
  '',
  'Loading TEMPL3 kernel...',
  'Mounting /dev/sanctum...',
  'Initializing sigterm daemon...',
  '',
  '[  OK  ] Started filsistem',
  '[  OK  ] Reached target: Desktop',
  '',
  'Welcome, Operator.',
]

export function BootSequence() {
  const [visible, setVisible] = useState(true)
  const [currentLine, setCurrentLine] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const hasBooted = sessionStorage.getItem('templ3-booted')
    const isMaximized = window.location.search.includes('maximized')
    if (hasBooted || isMaximized) {
      sessionStorage.setItem('templ3-booted', '1')
      setDone(true)
      return
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      sessionStorage.setItem('templ3-booted', '1')
      setDone(true)
      return
    }

    let line = 0
    const interval = setInterval(() => {
      line++
      if (line >= BOOT_LINES.length) {
        clearInterval(interval)
        setTimeout(() => {
          sessionStorage.setItem('templ3-booted', '1')
          setVisible(false)
          setTimeout(() => setDone(true), 500)
        }, 800)
      }
      setCurrentLine(line)
    }, 120)

    return () => clearInterval(interval)
  }, [])

  if (done) return null

  return (
    <div
      className="boot-sequence"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '10%',
        background: 'oklch(4% 0.008 60)',
        color: 'oklch(72% 0.14 80)',
        fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
        fontSize: '12px',
        lineHeight: 1.6,
        opacity: visible ? 1 : 0,
        transition: 'opacity 500ms ease',
      }}
    >
      {BOOT_LINES.slice(0, currentLine + 1).map((line, i) => (
        <div key={i} style={{ whiteSpace: 'pre' }}>
          {line}
          {i === currentLine && line && (
            <span style={{ animation: 'blink 1s step-end infinite' }}>█</span>
          )}
        </div>
      ))}
    </div>
  )
}
