import { operator, socialLinks as defaultSocialLinks, inspirations as defaultInspirations } from '../../../data/siteConfig'
import type { CmsSiteIdentity, CmsMedia } from '../../../lib/cms'
import { NowPlaying } from '../../NowPlaying'

type Props = {
  onOpenApp?: (appId: string) => void
  siteIdentity?: CmsSiteIdentity
}

function resolveMediaUrl(value: CmsMedia | string | null | undefined): string | undefined {
  if (!value) return undefined
  if (typeof value === 'string') return undefined
  return value.url ?? undefined
}

export function DossierApp({ onOpenApp, siteIdentity }: Props) {
  // CMS-first, siteConfig fallback for every field
  const handle = siteIdentity?.handle ?? operator.handle
  const status = siteIdentity?.status?.toUpperCase() ?? operator.status
  const role = siteIdentity?.role ?? operator.role
  const specialty = siteIdentity?.specialty ?? operator.specialty

  const aliases = siteIdentity?.aliases?.length
    ? siteIdentity.aliases.map(a => a.alias)
    : operator.aliases

  const bio = siteIdentity?.bio?.length
    ? siteIdentity.bio.map(b => b.paragraph)
    : operator.bio

  const avatarUrl = resolveMediaUrl(siteIdentity?.avatar) ?? operator.avatar

  const links = siteIdentity?.aliases !== undefined
    // If CMS has siteIdentity, social links come from the CMS Links collection (CommsApp)
    // but for the quick-link icons in Dossier we fall back to siteConfig
    ? defaultSocialLinks
    : defaultSocialLinks

  const inspirations = siteIdentity?.inspirations?.length
    ? siteIdentity.inspirations.map(i => i.tag)
    : defaultInspirations

  return (
    <div className="dossier">
      <div className="dossier-top">
        <div className="dossier-photo-column">
          <div className="dossier-photo-wrapper">
            <div className="dossier-stamp-overlay">
              <span className="dossier-stamp-line dossier-stamp-line--redacted">CLASSIFIED</span>
              <span className="dossier-stamp-line dossier-stamp-line--clear">DECLASSIFIED</span>
            </div>
            <img src={avatarUrl} alt={handle} className="dossier-photo" />
          </div>
          <span className="dossier-status" data-status={status.toLowerCase()}>
            {status}
          </span>
          <div className="dossier-quick-links">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="dossier-quick-link"
                title={link.label}
              >
                {link.logo ? (
                  <span
                    className="dossier-quick-link__icon"
                    style={{
                      maskImage: `url(${link.logo})`,
                      WebkitMaskImage: `url(${link.logo})`,
                    } as React.CSSProperties}
                  />
                ) : (
                  <span>{link.icon}</span>
                )}
              </a>
            ))}
          </div>
        </div>
        <div className="dossier-bio-column">
          <h3 className="eyebrow">Bio</h3>
          {bio.map((p, i) => (
            <p key={i} className="copy">{p}</p>
          ))}
        </div>
        <div className="dossier-now-column">
          <h3 className="eyebrow">Now listening</h3>
          <NowPlaying />
        </div>
      </div>

      <section className="dossier-section dossier-section--ficha">
        <h3 className="eyebrow">Record</h3>
        <div className="dossier-fields">
          <Field label="Handle" value={handle} />
          <Field label="AKA" value={aliases.join(', ')} />
          <Field label="Role" value={role} />
          <Field label="Specialty" value={specialty} />
        </div>
      </section>

      <div className="dossier-cta-wrapper">
        <button
          type="button"
          className="dossier-cta"
          onClick={() => onOpenApp?.('gazette')}
        >
          Read my blog!!!
        </button>
      </div>

      <section className="dossier-section">
        <h3 className="eyebrow">Inspirations</h3>
        <div className="dossier-inspirations">
          {inspirations.map((tag) => (
            <span key={tag} className="dossier-tag">{tag}</span>
          ))}
        </div>
      </section>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="dossier-field">
      <span className="dossier-field__label">{label}</span>
      <span className="dossier-field__value">{value}</span>
    </div>
  )
}
