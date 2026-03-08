import { navGuide } from '../../../data/siteConfig'

export function ReadmeApp() {
  return (
    <div className="readme">
      <pre className="readme-text">{navGuide.lines.join('\n')}</pre>
    </div>
  )
}
