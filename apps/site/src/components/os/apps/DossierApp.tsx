import { operator, socialLinks, inspirations } from '../../../data/siteConfig'
import { NowPlaying } from '../../NowPlaying'

export function DossierApp({ onOpenApp }: { onOpenApp?: (appId: string) => void }) {
  return (
    <div className="dossier">
      <div className="dossier-top">
        <div className="dossier-photo-column">
          <div className="dossier-photo-wrapper">
            <div className="dossier-stamp-overlay">
              <span className="dossier-stamp-line dossier-stamp-line--redacted">CLASSIFIED</span>
              <span className="dossier-stamp-line dossier-stamp-line--clear">DECLASSIFIED</span>
            </div>
            <img src={operator.avatar} alt={operator.handle} className="dossier-photo" />
          </div>
          <span className="dossier-status" data-status={operator.status.toLowerCase()}>
            {operator.status}
          </span>
          <div className="dossier-quick-links">
            {socialLinks.map((link) => (
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
          {operator.bio.map((p, i) => (
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
          <Field label="Handle" value={operator.handle} />
          <Field label="AKA" value={operator.aliases.join(', ')} />
          <Field label="Role" value={operator.role} />
          <Field label="Specialty" value={operator.specialty} />
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
