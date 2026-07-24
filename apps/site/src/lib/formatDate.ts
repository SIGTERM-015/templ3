export function formatDate(dateStr: string | undefined, locale = 'es-ES'): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}
