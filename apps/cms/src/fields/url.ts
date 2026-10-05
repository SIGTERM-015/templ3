import type { TextFieldSingleValidation } from 'payload'

/**
 * Rejects anything that is not an absolute URL with one of `schemes`. URL fields are
 * rendered straight into href/src attributes on the public site, so `javascript:` or
 * `data:` values would execute in visitors' browsers.
 */
export const safeUrl =
  (schemes: string[] = ['https:']): TextFieldSingleValidation =>
  (value) => {
    if (!value) return true
    try {
      const { protocol } = new URL(value)
      if (schemes.includes(protocol)) return true
    } catch {
      /* not an absolute URL */
    }
    return `Must be a full URL starting with ${schemes.join(' or ')}`
  }
