import { useEffect, useMemo, useState } from 'react'
import type { CmsMedia, CmsProject, CmsProjectStatus } from '../../../lib/cms'
import { statusColors } from '../../../data/siteConfig'

// Fallback colors if CMS has no project statuses configured
const FALLBACK_COLORS: Record<string, string> = statusColors

function resolveProjectStatusValue(ps: CmsProjectStatus | string): string {
  if (typeof ps === 'string') return ps
  return ps.value
}

function resolveProjectStatusLabel(ps: CmsProjectStatus | string): string {
  if (typeof ps === 'string') return ps
  return ps.label
}

function resolveProjectStatusColor(
  ps: CmsProjectStatus | string,
  statusMap: Map<string, CmsProjectStatus>,
): string {
  const value = resolveProjectStatusValue(ps)
  if (typeof ps !== 'string' && ps.color) return ps.color
  const found = statusMap.get(value)
  if (found?.color) return found.color
  return FALLBACK_COLORS[value.toLowerCase()] ?? 'var(--faded)'
}

function resolveProjectStatusIconUrl(
  ps: CmsProjectStatus | string,
): string | undefined {
  if (typeof ps === 'string') return undefined
  if (!ps.icon) return undefined
  if (typeof ps.icon === 'string') return undefined
  return (ps.icon as CmsMedia).url ?? undefined
}

type Props = {
  serverData?: Record<string, unknown>
}

export function ArmoryApp({ serverData }: Props) {
  const initialProjects = (serverData?.projects as CmsProject[]) ?? []
  const initialStatuses = (serverData?.projectStatuses as CmsProjectStatus[]) ?? []

  const [projects, setProjects] = useState<CmsProject[]>(initialProjects)
  const [projectStatuses, setProjectStatuses] = useState<CmsProjectStatus[]>(initialStatuses)
  const [loading, setLoading] = useState(!initialProjects.length)

  useEffect(() => {
    const fetches: Promise<void>[] = []

    if (initialProjects.length === 0) {
      fetches.push(
        fetch('/api/projects.json')
          .then(r => r.json() as Promise<CmsProject[]>)
          .then((data) => setProjects(data))
          .catch(() => {}),
      )
    }

    if (initialStatuses.length === 0) {
      fetches.push(
        fetch('/api/project-statuses.json')
          .then(r => r.json() as Promise<CmsProjectStatus[]>)
          .then((data) => setProjectStatuses(data))
          .catch(() => {}),
      )
    }

    if (fetches.length > 0) {
      Promise.all(fetches).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const statusMap = useMemo(() => {
    const map = new Map<string, CmsProjectStatus>()
    for (const s of projectStatuses) map.set(s.value, s)
    return map
  }, [projectStatuses])

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
          const ps = project.projectStatus
          const statusValue = resolveProjectStatusValue(ps)
          const statusLabel = resolveProjectStatusLabel(ps)
          const color = resolveProjectStatusColor(ps, statusMap)
          const iconUrl = resolveProjectStatusIconUrl(ps)

          return (
            <div key={project.id} className="armory-card">
              <div className="armory-card__header">
                {iconUrl && (
                  <img
                    src={iconUrl}
                    alt={statusLabel}
                    className="armory-card__status-icon"
                    title={statusLabel}
                  />
                )}
                <div className="armory-card__title-row">
                  {!iconUrl && (
                    <span
                      className="armory-card__led"
                      style={{ backgroundColor: color }}
                      title={statusLabel}
                    />
                  )}
                  <h3 className="armory-card__title">{project.title}</h3>
                </div>
              </div>
              <p className="armory-card__summary">{project.summary}</p>
              <div className="armory-card__status">
                <span
                  className="tag"
                  style={{ borderColor: color, color }}
                  data-status={statusValue}
                >
                  {statusLabel}
                </span>
              </div>
              {stack.length > 0 && (
                <ul className="tag-list" style={{ marginTop: '8px' }}>
                  {stack.map(s => <li key={s} className="tag">{s}</li>)}
                </ul>
              )}
              <div className="armory-card__links">
                {project.externalUrl && (
                  <a
                    href={project.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button--ghost"
                    style={{ minHeight: 'auto', padding: '4px 12px', fontSize: '11px' }}
                  >
                    Demo
                  </a>
                )}
                {project.repositoryUrl && (
                  <a
                    href={project.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="button--ghost"
                    style={{ minHeight: 'auto', padding: '4px 12px', fontSize: '11px' }}
                  >
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
