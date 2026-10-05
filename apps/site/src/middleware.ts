import { defineMiddleware } from 'astro:middleware'

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  // The desktop embeds other sites, but nothing should embed the desktop
  'Content-Security-Policy': "frame-ancestors 'self'",
}

export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next()
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    if (!response.headers.has(name)) response.headers.set(name, value)
  }
  return response
})
