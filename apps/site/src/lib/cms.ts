import { cachedJson } from './edgeCache'
import { workerEnv } from './env'

// ─── Shared primitive types ────────────────────────────────────────────────

export type CmsMedia = {
  id: string
  alt?: string
  url?: string
  width?: number
  height?: number
}

export type CmsTag = {
  id: string
  name: string
  slug: string
  color?: string
}

export type CmsCategory = {
  id: string
  name: string
  slug: string
  description?: string
  icon?: CmsMedia | string | null
}

// ─── Config collection types ────────────────────────────────────────────────

export type CmsProjectStatus = {
  id: string
  value: string
  label: string
  color?: string
  glyph?: string
  icon?: CmsMedia | string | null
  order: number
}

// ─── Content collection types ───────────────────────────────────────────────

export type CmsPost = {
  id: string
  slug: string
  title: string
  excerpt?: string
  publishedAt?: string
  featured?: boolean
  category?: CmsCategory | string | null
  tags?: CmsTag[]
  heroImage?: CmsMedia | string | null
  content?: unknown
}

export type CmsProject = {
  id: string
  title: string
  slug: string
  summary: string
  /** Now a relationship to project-statuses (populated object or string ID) */
  projectStatus: CmsProjectStatus | string
  stack: string[] | { label: string }[]
  featured?: boolean
  externalUrl?: string
  repositoryUrl?: string
}

export type CmsLink = {
  id: string
  label: string
  href: string
  platform?: string
  description?: string
  icon?: string
  logo?: CmsMedia | string | null
  featured?: boolean
}

export type CmsNote = {
  id: string
  title: string
  slug: string
  filename: string
  content: string
  publishedAt?: string
  order: number
}

export type CmsGuestbookEntry = {
  id: string
  authorName: string
  authorAvatar?: string
  authorDiscordId?: string
  clerkUserId?: string
  image: CmsMedia | string
  message?: string
  embedUrl?: string
  embedType?: 'none' | 'spotify' | 'youtube'
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  updatedAt: string
}

export type CmsWebApp = {
  id: string
  title: string
  slug: string
  url: string
  icon?: string
  description?: string
  defaultSize?: {
    width?: number
    height?: number
  }
  showAddressBar?: boolean
  showInDesktop?: boolean
  showInMenu?: boolean
  enabled?: boolean
  sortOrder?: number
}

// ─── Global: SiteIdentity ───────────────────────────────────────────────────

export type CmsSiteIdentity = {
  // Site metadata
  siteName?: string
  siteDomain?: string
  siteEmail?: string
  siteDescription?: string
  wallpaper?: CmsMedia | string | null

  // Operator profile
  handle?: string
  aliases?: { alias: string }[]
  role?: string
  specialty?: string
  status?: 'active' | 'away' | 'inactive'
  claim?: string
  intro?: string
  bio?: { paragraph: string }[]
  avatar?: CmsMedia | string | null
  inspirations?: { tag: string }[]

  // README / NavGuide
  navGuideTitle?: string
  navGuideLines?: { line: string }[]

  // Terminal
  terminalPrompt?: string
  terminalPwd?: string
  terminalUname?: string
  whoamiOutput?: string
  neofetchOutput?: string
}
type CollectionResponse<T> = {
  docs: T[]
}


export const TTL = {
  SHORT: 300,
  MEDIUM: 900,
  STANDARD: 3600,
  LONG: 86400,
} as const

/** Browsers revalidate at most every 5 minutes; shared caches may keep the CMS TTL. */
const BROWSER_MAX_AGE = TTL.SHORT

/**
 * JSON response for public CMS data, cached for the same TTL used when reading the CMS.
 * `null` means the CMS was unavailable: answer 503 uncached so the outage isn't served
 * from cache after the CMS recovers.
 */
export function cmsJsonResponse(
  data: unknown,
  ttl: number,
  browserMaxAge: number = BROWSER_MAX_AGE,
): Response {
  if (data === null) {
    return new Response(JSON.stringify({ error: 'CMS unavailable' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    })
  }
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${Math.min(ttl, browserMaxAge)}, s-maxage=${ttl}`,
    },
  })
}

const COLLECTION_PATHS = {
  posts: '/api/posts?depth=2&limit=50&where[_status][equals]=published&sort=-publishedAt',
  projects: '/api/projects?depth=2&limit=12&where[_status][equals]=published&sort=order',
  links: '/api/links?depth=1&limit=50&sort=platform',
  categories: '/api/categories?depth=1&limit=50&sort=name',
  notes: '/api/notes?depth=0&limit=100&where[_status][equals]=published&sort=order',
  webApps: '/api/web-apps?depth=0&limit=50&where[enabled][equals]=true&sort=sortOrder',
  guestbookEntries: '/api/guestbook-entries?depth=1&limit=100&where[status][equals]=approved&sort=-createdAt',
  projectStatuses: '/api/project-statuses?depth=1&limit=50&sort=order',
  siteIdentity: '/api/globals/site-identity?depth=2',
} as const

/**
 * Fetches a CMS document as JSON. Resolves to `null` when the CMS is unreachable or
 * answers with an error, so callers can tell "unavailable" apart from "empty".
 */
async function readCms<T>(path: string, cacheTtl: number): Promise<T | null> {
  const [rawCmsUrl, apiKey] = await Promise.all([
    workerEnv('PUBLIC_CMS_URL'),
    workerEnv('PAYLOAD_API_KEY'),
  ])
  const cmsBaseUrl = rawCmsUrl?.replace(/\/$/, '')
  if (!cmsBaseUrl) return null

  return cachedJson<T>(`cms${path}`, cacheTtl, async () => {
    try {
      const headers: HeadersInit = {}
      if (apiKey) headers['Authorization'] = `users API-Key ${apiKey}`

      const response = await fetch(`${cmsBaseUrl}${path}`, { headers })
      if (!response.ok) return null
      return (await response.json()) as T
    } catch {
      return null
    }
  })
}

/** Collection docs, or `null` when the CMS is unavailable. */
async function readCollection<T>(path: string, cacheTtl: number = TTL.STANDARD): Promise<T[] | null> {
  const data = await readCms<CollectionResponse<T>>(path, cacheTtl)
  return data && Array.isArray(data.docs) ? data.docs : null
}

async function readGlobal<T>(path: string, cacheTtl: number = TTL.LONG): Promise<T | null> {
  return readCms<T>(path, cacheTtl)
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function getSiteIdentity(): Promise<CmsSiteIdentity | null> {
  return readGlobal<CmsSiteIdentity>(COLLECTION_PATHS.siteIdentity, TTL.LONG)
}

export async function getPosts(): Promise<CmsPost[] | null> {
  return readCollection<CmsPost>(COLLECTION_PATHS.posts, TTL.SHORT)
}

export async function getPostBySlug(slug: string): Promise<CmsPost | null> {
  const posts = await readCollection<CmsPost>(
    `/api/posts?depth=2&limit=1&where[slug][equals]=${encodeURIComponent(slug)}&where[_status][equals]=published`,
    TTL.STANDARD,
  )
  return posts?.find((post) => post.slug === slug) ?? null
}

export async function getProjects(): Promise<CmsProject[] | null> {
  const projects = await readCollection<CmsProject>(COLLECTION_PATHS.projects, TTL.STANDARD)
  if (!projects) return null
  return projects.map((project) => ({
    ...project,
    stack: project.stack.map((item) => (typeof item === 'string' ? item : item.label)),
  }))
}

export async function getLinks(): Promise<CmsLink[] | null> {
  return readCollection<CmsLink>(COLLECTION_PATHS.links, TTL.LONG)
}

export async function getCategories(): Promise<CmsCategory[] | null> {
  return readCollection<CmsCategory>(COLLECTION_PATHS.categories, TTL.LONG)
}

export async function getNotes(): Promise<CmsNote[] | null> {
  return readCollection<CmsNote>(COLLECTION_PATHS.notes, TTL.MEDIUM)
}

export async function getProjectStatuses(): Promise<CmsProjectStatus[] | null> {
  return readCollection<CmsProjectStatus>(COLLECTION_PATHS.projectStatuses, TTL.LONG)
}

export async function getWebApps(): Promise<CmsWebApp[] | null> {
  return readCollection<CmsWebApp>(COLLECTION_PATHS.webApps, TTL.STANDARD)
}

export async function getGuestbookEntries(): Promise<CmsGuestbookEntry[] | null> {
  return readCollection<CmsGuestbookEntry>(COLLECTION_PATHS.guestbookEntries, TTL.SHORT)
}
