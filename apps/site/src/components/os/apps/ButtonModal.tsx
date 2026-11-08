import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  name: string
  href: string
  src: string
  onClose: () => void
}

export function ButtonModal({ name, href, src, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const snippet =
    `<a href="${href}"><img src="${href}${src}" width="88" height="31" ` +
    `alt="${name}" style="image-rendering: pixelated"></a>`

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return createPortal(
    <div className="button-modal" onClick={onClose} role="dialog" aria-label="My button">
      <div className="button-modal__card" onClick={(e) => e.stopPropagation()}>
        <button className="button-modal__close" onClick={onClose} type="button" aria-label="Close">
          &times;
        </button>
        <h3 className="button-modal__title">my button</h3>
        <p className="button-modal__text">
          put it on your site! please <em>do</em> hotlink it, so that if i ever redraw it, yours
          updates too :3
        </p>
        <div className="button-modal__preview">
          <img src={src} width={88} height={31} alt={name} className="dossier-button" />
        </div>
        <code className="button-modal__code">{snippet}</code>
        <button className="button-modal__copy" onClick={copy} type="button">
          {copied ? 'copied!' : 'copy'}
        </button>
      </div>
    </div>,
    document.body,
  )
}
