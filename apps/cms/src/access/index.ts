import type { Access, PayloadRequest } from 'payload'

type Role = 'admin' | 'editor' | 'api'

const roleOf = (req: PayloadRequest): Role | undefined =>
  (req.user as { role?: Role } | null | undefined)?.role

/** Admins and editors author content. The `api` role (the site's key) only reads. */
export const isEditor: Access = ({ req }) => {
  const role = roleOf(req)
  return role === 'admin' || role === 'editor'
}

export const isAuthenticated: Access = ({ req }) => Boolean(req.user)

/** Drafts are visible to logged-in users; everyone else only sees published documents. */
export const publishedOrAuthenticated: Access = ({ req }) =>
  req.user ? true : { _status: { equals: 'published' } }

/** Read rule for a collection plus editor-only writes. */
export const editorWrites = {
  create: isEditor,
  update: isEditor,
  delete: isEditor,
}
