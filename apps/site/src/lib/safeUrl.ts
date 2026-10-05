const SAFE_SCHEMES = new Set(['https:', 'http:', 'mailto:'])

/**
 * Returns `url` only if it is absolute with a safe scheme. CMS values are rendered
 * into href/src, so a `javascript:` or `data:` URL stored before validation existed
 * (or slipped past it) must not reach the DOM.
 */
export function safeHref(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  try {
    return SAFE_SCHEMES.has(new URL(url).protocol) ? url : undefined
  } catch {
    return undefined
  }
}
