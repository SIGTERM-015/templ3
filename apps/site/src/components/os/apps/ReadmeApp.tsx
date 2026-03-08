import { navGuide } from '../../../data/siteConfig'
import type { CmsSiteIdentity } from '../../../lib/cms'

type Props = {
  siteIdentity?: CmsSiteIdentity
}

export function ReadmeApp({ siteIdentity }: Props) {
  // CMS-first: use navGuideLines from CMS if available, else fall back to siteConfig
  const lines = siteIdentity?.navGuideLines?.length
    ? siteIdentity.navGuideLines.map(l => l.line)
    : navGuide.lines

  return (
    <div className="readme">
      <pre className="readme-text">{lines.join('\n')}</pre>
    </div>
  )
}
