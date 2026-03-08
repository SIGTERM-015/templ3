import { useEffect, useRef, useState } from 'react'
import type { CmsSiteIdentity } from '../../../lib/cms'
import { useTerminal, type TerminalLine } from '../../terminal/useTerminal'
import { BSOD } from '../../terminal/ascii'

type Props = {
  onNavigate: (route: string) => void
  onOpenApp?: (appId: string) => void
  siteIdentity?: CmsSiteIdentity
}

export function TerminalApp({ onNavigate, onOpenApp, siteIdentity }: Props) {
  const config = { siteIdentity }
  const { lines, input, setInput, submit, navigateHistory, prompt } = useTerminal(config)
  const [showBsod, setShowBsod] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [lines])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = submit(input)

    if (result.action === 'navigate' && result.navigateTo) {
      setTimeout(() => onNavigate(result.navigateTo!), 400)
    }

    if (result.action === 'glitch') {
      document.body.classList.add('glitch-active')
      setTimeout(() => document.body.classList.remove('glitch-active'), 2000)
    }

    if (result.action === 'open_app' && result.appId) {
      setTimeout(() => onOpenApp?.(result.appId!), 400)
    }

    if (result.action === 'open_url' && result.openUrl) {
      setTimeout(() => window.open(result.openUrl!, '_blank', 'noopener'), 400)
    }

    if (result.action === 'bsod') {
      setShowBsod(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); navigateHistory('up') }
    if (e.key === 'ArrowDown') { e.preventDefault(); navigateHistory('down') }
  }

  return (
    <>
      <div className="term">
        <div className="term-scanlines" />
        <div ref={outputRef} className="term-output">
          {lines.map((line: TerminalLine) => (
            <div
              key={line.id}
              className={line.type === 'input' ? 'term-line--input' : 'term-line--output'}
            >
              {line.content}
            </div>
          ))}
        </div>
        <form className="term-input-row" onSubmit={handleSubmit}>
          <span className="term-prompt">{prompt}&nbsp;</span>
          <input
            ref={inputRef}
            className="term-input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="type a command..."
            autoComplete="off"
            spellCheck={false}
          />
        </form>
      </div>

      {showBsod && (
        <div className="term-bsod" onClick={() => setShowBsod(false)} role="button" tabIndex={0}>
          <pre className="term-bsod__text">{BSOD}</pre>
          <span className="term-bsod__hint">Press anywhere to reboot sanctum...</span>
        </div>
      )}
    </>
  )
}
