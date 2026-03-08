import { useEffect, useState } from 'react'
import type { CmsLink } from '../../../lib/cms'

type Props = {
  serverData?: Record<string, unknown>
}

function logoUrl(logo: CmsLink['logo']): string | null {
  if (!logo) return null
  if (typeof logo === 'string') return null
  return logo.url ?? null
}

export function CommsApp({ serverData }: Props) {
  const initialLinks = (serverData?.links as CmsLink[]) ?? []
  const [links, setLinks] = useState<CmsLink[]>(initialLinks)
  const [loading, setLoading] = useState(!initialLinks.length)

  useEffect(() => {
    if (initialLinks.length > 0) return
    setLoading(true)
    fetch('/api/links.json')
      .then(r => r.json())
      .then((data: unknown) => setLinks(data as CmsLink[]))
      .catch(() => setLinks([]))
      .finally(() => setLoading(false))
  }, [])

  const grouped = links.reduce((acc: Record<string, CmsLink[]>, link: CmsLink) => {
    const key = link.platform || 'Other'
    if (!acc[key]) acc[key] = []
    acc[key].push(link)
    return acc
  }, {})

  const empty = !loading && links.length === 0

  return (
    <div className="comms">
      <div className="comms-header">
        <span className="eyebrow">Contacts & Links</span>
      </div>

      {loading && <div className="gazette-loading">Synchronizing...</div>}
      {empty && <div className="gazette-loading">No links configured in CMS.</div>}

      {(Object.entries(grouped) as [string, CmsLink[]][]).map(([platform, platformLinks]) => (
        <div key={platform} className="comms-group">
          <h3 className="comms-group__title">{platform}</h3>
          <div className="comms-list">
            {platformLinks.map((link: CmsLink) => {
              const img = logoUrl(link.logo)
              return (
                <a
                  key={link.id}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="comms-contact"
                >
                  <div className="comms-contact__avatar">
                    {img
                      ? <img src={img} alt="" />
                      : <span className="comms-contact__icon">{link.icon || link.label.charAt(0)}</span>
                    }
                  </div>
                  <div className="comms-contact__info">
                    <span className="comms-contact__name">{link.label}</span>
                    <span className="comms-contact__desc">{link.description}</span>
                  </div>
                  <span className="comms-contact__arrow">→</span>
                </a>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
