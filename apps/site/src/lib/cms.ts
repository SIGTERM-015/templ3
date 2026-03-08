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

export type CmsMediaType = {
  id: string
  value: string
  label: string
  glyph?: string
  icon?: CmsMedia | string | null
  nowCategory: 'watching' | 'reading' | 'playing' | 'listening' | 'none'
  nowLabel?: string
  order: number
}

export type CmsMediaStatus = {
  id: string
  value: string
  label: string
  glyph?: string
  icon?: CmsMedia | string | null
  order: number
}

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

export type CmsFavMedia = {
  id: string
  title: string
  slug: string
  /** Now a relationship to media-statuses (populated object or string ID) */
  mediaType: CmsMediaType | string
  /** Now a relationship to media-statuses (populated object or string ID) */
  progress: CmsMediaStatus | string
  rating?: number
  review?: string
  coverImage?: CmsMedia | string | null
  blogPost?: CmsPost | string | null
  externalReviewUrl?: string
  completedAt?: string
  featured?: boolean
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

// ─── Internal fetch helpers ─────────────────────────────────────────────────

type CollectionResponse<T> = {
  docs: T[]
}

const CACHE_TTL = 43200 // 12 hours in seconds
const CACHE_ORIGIN = 'https://cms-cache.internal'

const cmsBaseUrl = import.meta.env.PUBLIC_CMS_URL?.replace(/\/$/, '')

const COLLECTION_PATHS = {
  posts: '/api/posts?depth=2&limit=50&where[_status][equals]=published&sort=-publishedAt',
  projects: '/api/projects?depth=2&limit=12&where[_status][equals]=published&sort=order',
  links: '/api/links?depth=1&limit=50&sort=platform',
  categories: '/api/categories?depth=1&limit=50&sort=name',
  favouriteMedia: '/api/favourite-media?depth=2&limit=50&where[_status][equals]=published&sort=-completedAt',
  notes: '/api/notes?depth=0&limit=100&where[_status][equals]=published&sort=order',
  mediaTypes: '/api/media-types?depth=1&limit=50&sort=order',
  mediaStatuses: '/api/media-statuses?depth=1&limit=50&sort=order',
  projectStatuses: '/api/project-statuses?depth=1&limit=50&sort=order',
  siteIdentity: '/api/globals/site-identity?depth=2',
} as const

function cacheKey(path: string): Request {
  return new Request(`${CACHE_ORIGIN}${path}`)
}

function isEdgeRuntime(): boolean {
  return typeof caches !== 'undefined' && typeof caches.default !== 'undefined'
}

async function readCollection<T>(path: string): Promise<T[]> {
  if (!cmsBaseUrl) return []

  if (isEdgeRuntime()) {
    const key = cacheKey(path)
    const cached = await caches.default.match(key)
    if (cached) return (await cached.json()) as T[]
  }

  try {
    const response = await fetch(`${cmsBaseUrl}${path}`)
    if (!response.ok) return []
    const data = (await response.json()) as CollectionResponse<T>
    const docs = Array.isArray(data.docs) ? data.docs : []

    if (isEdgeRuntime()) {
      const cacheResponse = new Response(JSON.stringify(docs), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `s-maxage=${CACHE_TTL}`,
        },
      })
      await caches.default.put(cacheKey(path), cacheResponse)
    }

    return docs
  } catch {
    return []
  }
}

async function readGlobal<T>(path: string): Promise<T | null> {
  if (!cmsBaseUrl) return null

  if (isEdgeRuntime()) {
    const key = cacheKey(path)
    const cached = await caches.default.match(key)
    if (cached) return (await cached.json()) as T
  }

  try {
    const response = await fetch(`${cmsBaseUrl}${path}`)
    if (!response.ok) return null
    const data = (await response.json()) as T

    if (isEdgeRuntime()) {
      const cacheResponse = new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `s-maxage=${CACHE_TTL}`,
        },
      })
      await caches.default.put(cacheKey(path), cacheResponse)
    }

    return data
  } catch {
    return null
  }
}

// ─── Cache purge ────────────────────────────────────────────────────────────

export async function purgeCache(slugs?: string[]): Promise<number> {
  if (!isEdgeRuntime()) return 0

  const cache = caches.default
  let purged = 0

  for (const path of Object.values(COLLECTION_PATHS)) {
    if (await cache.delete(cacheKey(path))) purged++
  }

  if (slugs) {
    for (const slug of slugs) {
      const path = `/api/posts?depth=2&limit=1&where[slug][equals]=${encodeURIComponent(slug)}&where[_status][equals]=published`
      if (await cache.delete(cacheKey(path))) purged++
    }
  }

  return purged
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function getSiteIdentity(): Promise<CmsSiteIdentity | null> {
  return readGlobal<CmsSiteIdentity>(COLLECTION_PATHS.siteIdentity)
}

export async function getPosts(): Promise<CmsPost[]> {
  return readCollection<CmsPost>(COLLECTION_PATHS.posts)
}

export async function getPostBySlug(slug: string): Promise<CmsPost | null> {
  const posts = await readCollection<CmsPost>(
    `/api/posts?depth=2&limit=1&where[slug][equals]=${encodeURIComponent(slug)}&where[_status][equals]=published`,
  )
  return posts.find((post) => post.slug === slug) ?? null
}

export async function getProjects(): Promise<CmsProject[]> {
  const projects = await readCollection<CmsProject>(COLLECTION_PATHS.projects)
  return projects.map((project) => ({
    ...project,
    stack: project.stack.map((item) => (typeof item === 'string' ? item : item.label)),
  }))
}

export async function getLinks(): Promise<CmsLink[]> {
  return readCollection<CmsLink>(COLLECTION_PATHS.links)
}

export async function getCategories(): Promise<CmsCategory[]> {
  return readCollection<CmsCategory>(COLLECTION_PATHS.categories)
}

export async function getFavouriteMedia(): Promise<CmsFavMedia[]> {
  return readCollection<CmsFavMedia>(COLLECTION_PATHS.favouriteMedia)
}

export async function getNotes(): Promise<CmsNote[]> {
  return readCollection<CmsNote>(COLLECTION_PATHS.notes)
}

export async function getMediaTypes(): Promise<CmsMediaType[]> {
  return readCollection<CmsMediaType>(COLLECTION_PATHS.mediaTypes)
}

export async function getMediaStatuses(): Promise<CmsMediaStatus[]> {
  return readCollection<CmsMediaStatus>(COLLECTION_PATHS.mediaStatuses)
}

export async function getProjectStatuses(): Promise<CmsProjectStatus[]> {
  return readCollection<CmsProjectStatus>(COLLECTION_PATHS.projectStatuses)
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Resolve a CmsMedia relationship to its URL */
export function mediaUrl(value: CmsMedia | string | null | undefined): string | undefined {
  if (!value) return undefined
  if (typeof value === 'string') return undefined
  return value.url ?? undefined
}

/** Resolve a populated relationship's value field (CmsMediaType, CmsMediaStatus, CmsProjectStatus) */
export function resolveValue<T extends { value: string }>(
  rel: T | string | null | undefined,
): string | undefined {
  if (!rel) return undefined
  if (typeof rel === 'string') return rel
  return rel.value
}
