import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  experimental: {
    // payload.config starts a wrangler platform proxy when evaluated. Next 16 collects page
    // data in parallel workers, and their proxies race on Miniflare's local SQLite state
    // (SQLITE_BUSY), so collect in a single worker.
    cpus: 1,
  },
  images: {
    unoptimized: true,
  },
  serverExternalPackages: ['pg', 'pg-cloudflare', 'jose'],
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
      {
        // Uploads are served from this origin, where the admin session lives. A sandboxed
        // CSP keeps an uploaded SVG or HTML file from running script against it.
        source: '/api/media/file/:path*',
        headers: [{ key: 'Content-Security-Policy', value: "default-src 'none'; style-src 'unsafe-inline'; sandbox" }],
      },
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
