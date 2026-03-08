import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CmsPost, CmsCategory, CmsMedia } from '../../../lib/cms'
import { PayloadRichText } from '../../blog/PayloadRichText'

type Props = {
  serverData?: Record<string, unknown>
  onUpdateRoute?: (route: string) => void
}

type GroupedFolder = { category: CmsCategory | null; posts: CmsPost[] }

export function GazetteApp({ serverData, onUpdateRoute }: Props) {
  const initialPosts = (serverData?.posts as CmsPost[]) ?? []
  const initialPost = (serverData?.post as CmsPost) ?? null

  const [posts, setPosts] = useState<CmsPost[]>(initialPosts)
  const [categories, setCategories] = useState<CmsCategory[]>([])
  const [selected, setSelected] = useState<CmsPost | null>(initialPost)
  const [loading, setLoading] = useState(!initialPosts.length && !initialPost)
  const [loadingPost, setLoadingPost] = useState(false)
  const [copied, setCopied] = useState(false)
  const [search, setSearch] = useState('')
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set(['all']))

  const selectPost = useCallback((post: CmsPost) => {
    if (post.content) {
      setSelected(post)
      onUpdateRoute?.(`/blog/${post.slug}`)
      return
    }
    setLoadingPost(true)
    fetch(`/api/post/${post.slug}.json`)
      .then(r => r.json() as Promise<CmsPost>)
      .then((full) => {
        setSelected(full)
        onUpdateRoute?.(`/blog/${full.slug}`)
      })
      .catch(() => setSelected(post))
      .finally(() => setLoadingPost(false))
  }, [onUpdateRoute])

  useEffect(() => {
    if (initialPosts.length === 0) {
      fetch('/api/posts.json')
        .then(r => r.json() as Promise<CmsPost[]>)
        .then((data) => setPosts(data))
        .catch(() => {})
        .finally(() => setLoading(false))
    }
    fetch('/api/categories.json')
      .then(r => r.json() as Promise<CmsCategory[]>)
      .then((data) => setCategories(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (selected || posts.length === 0) return
    selectPost(posts[0])
  }, [posts])

  const goBack = useCallback(() => {
    setSelected(null)
    onUpdateRoute?.('/blog')
  }, [onUpdateRoute])

  const heroUrl = (post: CmsPost) => {
    if (!post.heroImage) return undefined
    if (typeof post.heroImage === 'string') return post.heroImage
    return post.heroImage.url
  }

  const formatDate = (d?: string) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  const sharePost = useCallback((slug: string) => {
    const url = `${window.location.origin}/blog/${slug}?maximized`
    if (navigator.share) {
      navigator.share({ title: selected?.title, url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }).catch(() => {})
    }
  }, [selected])

  const toggleFolder = useCallback((id: string) => {
    setOpenFolders((prev: Set<string>) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const postCategorySlug = (post: CmsPost): string => {
    if (!post.category) return ''
    if (typeof post.category === 'string') return post.category
    return post.category.slug
  }

  const q = search.toLowerCase().trim()

  const filteredPosts = useMemo(() => {
    if (!q) return posts
    return posts.filter((p: CmsPost) =>
      p.title.toLowerCase().includes(q) ||
      p.tags?.some((t: { name: string }) => t.name.toLowerCase().includes(q))
    )
  }, [posts, q])

  const grouped = useMemo(() => {
    const map: Record<string, GroupedFolder> = {}
    const uncategorized: CmsPost[] = []

    for (const post of filteredPosts) {
      const catSlug = postCategorySlug(post)
      if (!catSlug) {
        uncategorized.push(post)
        continue
      }
      if (!map[catSlug]) {
        const cat = categories.find((c: CmsCategory) => c.slug === catSlug) ??
          (typeof post.category === 'object' && post.category ? post.category : null)
        map[catSlug] = { category: cat, posts: [] }
      }
      map[catSlug].posts.push(post)
    }

    return { folders: Object.entries(map) as [string, GroupedFolder][], uncategorized }
  }, [filteredPosts, categories])

  const isSearching = q.length > 0

  const renderPostCard = (post: CmsPost) => {
    const hero = heroUrl(post)
    return (
      <button
        key={post.id}
        className="gazette-card"
        data-active={selected?.id === post.id}
        onClick={() => selectPost(post)}
        style={hero ? { backgroundImage: `linear-gradient(oklch(0% 0 0 / 0.7), oklch(0% 0 0 / 0.85)), url(${hero})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        <span className="gazette-card__date">{formatDate(post.publishedAt)}</span>
        <span className="gazette-card__title">{post.title}</span>
        {post.tags && post.tags.length > 0 && (
          <span className="gazette-card__tags">
            {post.tags.map((t: { name: string }) => t.name).join(' · ')}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="gazette">
      <div className="gazette-sidebar">
        <div className="gazette-sidebar__header">
          <span className="eyebrow">Posts</span>
          <input
            type="text"
            className="gazette-search"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {loading && <div className="gazette-loading">Loading...</div>}
        <div className="gazette-list">
          {isSearching ? (
            filteredPosts.length === 0
              ? <div className="gazette-loading">No results</div>
              : filteredPosts.map(renderPostCard)
          ) : (
            <>
              {grouped.folders.map(([slug, { category, posts: catPosts }]: [string, GroupedFolder]) => (
                <div key={slug} className="gazette-folder">
                  <button
                    className="gazette-folder__toggle"
                    onClick={() => toggleFolder(slug)}
                  >
                    <span className="gazette-folder__icon">
                      {openFolders.has(slug) ? '▾' : '▸'}
                    </span>
                    {category?.icon && typeof category.icon === 'object' && (category.icon as CmsMedia).url
                      ? <img className="gazette-folder__img" src={(category.icon as CmsMedia).url} alt="" />
                      : <span className="gazette-folder__emoji">📁</span>}
                    <span className="gazette-folder__name">{category?.name || slug}</span>
                    <span className="gazette-folder__count">{catPosts.length}</span>
                  </button>
                  {openFolders.has(slug) && (
                    <div className="gazette-folder__posts">
                      {catPosts.map(renderPostCard)}
                    </div>
                  )}
                </div>
              ))}
              {grouped.uncategorized.length > 0 && (
                <div className="gazette-folder">
                  <button
                    className="gazette-folder__toggle"
                    onClick={() => toggleFolder('_uncategorized')}
                  >
                    <span className="gazette-folder__icon">
                      {openFolders.has('_uncategorized') ? '▾' : '▸'}
                    </span>
                    <span className="gazette-folder__emoji">📄</span>
                    <span className="gazette-folder__name">Uncategorized</span>
                    <span className="gazette-folder__count">{grouped.uncategorized.length}</span>
                  </button>
                  {openFolders.has('_uncategorized') && (
                    <div className="gazette-folder__posts">
                      {grouped.uncategorized.map(renderPostCard)}
                    </div>
                  )}
                </div>
              )}
              {filteredPosts.length === 0 && !loading && (
                <div className="gazette-loading">No posts yet</div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="gazette-reader">
        {loadingPost && <div className="gazette-loading">Loading post...</div>}

        {!selected && !loadingPost && (
          <div className="gazette-empty">
            <span className="gazette-empty__icon">&gt;&gt;</span>
            <p>Select a post from the list</p>
          </div>
        )}

        {selected && !loadingPost && (
          <article className="gazette-article">
            <div className="gazette-toolbar">
              <button className="gazette-back" onClick={goBack}>← Back</button>
              <button className="gazette-share" onClick={() => sharePost(selected.slug)}>
                {copied ? '✓ Copied' : '↗ Share'}
              </button>
            </div>
            {heroUrl(selected) && (
              <img className="gazette-hero" src={heroUrl(selected)} alt={selected.title} />
            )}
            <h1>{selected.title}</h1>
            <div className="article-meta">
              {formatDate(selected.publishedAt)}
              {selected.tags && ` · ${selected.tags.map((t: { name: string }) => t.name).join(', ')}`}
            </div>
            <div className="article-content">
              {selected.content ? (
                <PayloadRichText data={selected.content} />
              ) : (
                <p className="copy">{selected.excerpt ?? 'No content available.'}</p>
              )}
            </div>
          </article>
        )}
      </div>
    </div>
  )
}
