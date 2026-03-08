import { useEffect, useState } from 'react'
import type { CmsProject } from '../../../lib/cms'
import { statusColors } from '../../../data/siteConfig'

type Props = {
  serverData?: Record<string, unknown>
}

export function ArmoryApp({ serverData }: Props) {
  const initialProjects = (serverData?.projects as CmsProject[]) ?? []
  const [projects, setProjects] = useState<CmsProject[]>(initialProjects)
  const [loading, setLoading] = useState(!initialProjects.length)

  useEffect(() => {
    if (initialProjects.length > 0) return
    fetch('/api/projects.json')
      .then(r => r.json())
      .then((data) => setProjects(data as CmsProject[]))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const statusColor = (status: string) =>
    statusColors[status.toLowerCase()] ?? 'var(--faded)'

  return (
    <div className="armory">
      <div className="armory-toolbar">
        <span className="eyebrow">Projects</span>
        <span className="label">{projects.length} items</span>
      </div>

      {loading && <div className="armory-loading">Scanning...</div>}

      <div className="armory-grid">
        {projects.map((project: CmsProject) => {
          const stack = project.stack as string[]
          return (
            <div key={project.id} className="armory-card">
              <div className="armory-card__header">
                <span
                  className="armory-card__led"
                  style={{ backgroundColor: statusColor(project.projectStatus) }}
                  title={project.projectStatus}
                />
                <h3 className="armory-card__title">{project.title}</h3>
              </div>
              <p className="armory-card__summary">{project.summary}</p>
              <div className="armory-card__status">
                <span className="tag" style={{ borderColor: statusColor(project.projectStatus), color: statusColor(project.projectStatus) }}>
                  {project.projectStatus}
                </span>
              </div>
              {stack.length > 0 && (
                <ul className="tag-list" style={{ marginTop: '8px' }}>
                  {stack.map(s => <li key={s} className="tag">{s}</li>)}
                </ul>
              )}
              <div className="armory-card__links">
                {project.externalUrl && (
                  <a href={project.externalUrl} target="_blank" rel="noopener noreferrer" className="button--ghost" style={{ minHeight: 'auto', padding: '4px 12px', fontSize: '11px' }}>
                    Demo
                  </a>
                )}
                {project.repositoryUrl && (
                  <a href={project.repositoryUrl} target="_blank" rel="noopener noreferrer" className="button--ghost" style={{ minHeight: 'auto', padding: '4px 12px', fontSize: '11px' }}>
                    Repo
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
