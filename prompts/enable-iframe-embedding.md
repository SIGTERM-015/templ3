# Enable iframe Embedding for Cloudflare Workers/Pages Sites

## Task

Configure a Cloudflare Workers or Pages site to allow being embedded as an iframe on `sigterm.vodka` and its subdomains.

## Context

The main site at `sigterm.vodka` has a desktop OS interface that can embed external sites as "WebApp" windows using iframes. By default, most sites block iframe embedding via security headers. This needs to be configured to allow embedding from the parent domain.

## Required Changes

### Option 1: Cloudflare Pages with `_headers` file

Create or modify the `_headers` file in the `public/` or root directory:

```
/*
  Content-Security-Policy: frame-ancestors 'self' https://sigterm.vodka https://*.sigterm.vodka
```

### Option 2: Cloudflare Workers with custom headers

If the site uses a Worker, modify the response headers:

```typescript
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const response = await handleRequest(request, env, ctx)
    
    // Clone response to modify headers
    const newResponse = new Response(response.body, response)
    
    // Allow iframe embedding from sigterm.vodka
    newResponse.headers.set(
      'Content-Security-Policy',
      "frame-ancestors 'self' https://sigterm.vodka https://*.sigterm.vodka"
    )
    
    // Remove X-Frame-Options if present (deprecated but some frameworks add it)
    newResponse.headers.delete('X-Frame-Options')
    
    return newResponse
  },
}
```

### Option 3: Astro with Cloudflare adapter

If using Astro, add middleware in `src/middleware.ts`:

```typescript
import { defineMiddleware } from 'astro:middleware'

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next()
  
  response.headers.set(
    'Content-Security-Policy',
    "frame-ancestors 'self' https://sigterm.vodka https://*.sigterm.vodka"
  )
  response.headers.delete('X-Frame-Options')
  
  return response
})
```

### Option 4: Next.js on Cloudflare

In `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://sigterm.vodka https://*.sigterm.vodka",
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

## Security Notes

1. **`frame-ancestors`** is the modern standard (CSP Level 2). It replaces the deprecated `X-Frame-Options` header.

2. **Be specific with allowed origins**. Only allow the domains that need to embed the site:
   - `'self'` - allows the site to embed itself
   - `https://sigterm.vodka` - the main domain
   - `https://*.sigterm.vodka` - all subdomains

3. **Never use `frame-ancestors *`** in production unless you explicitly want any site to embed yours.

## Verification

After deploying, test that the iframe works:

1. Open `https://sigterm.vodka`
2. Open the WebApp that embeds the configured site
3. Check browser DevTools console for any CSP or X-Frame-Options errors
4. The embedded site should load without "Refused to display in a frame" errors

## Troubleshooting

If still blocked after changes:

1. **Clear CDN cache** - Cloudflare may cache old headers. Purge cache in the Cloudflare dashboard.
2. **Check for multiple CSP headers** - Some frameworks add their own. Ensure only one `Content-Security-Policy` header exists.
3. **Check for meta tags** - Some sites set CSP via `<meta>` tags in HTML. These need to be removed or modified.
4. **Inspect response headers** - Use DevTools Network tab to verify the correct headers are being sent.
