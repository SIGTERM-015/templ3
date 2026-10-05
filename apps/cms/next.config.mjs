import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
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
  webpack: (webpackConfig, { isServer }) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    if (isServer) {
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        'sharp$': false,
      }
    }

    return webpackConfig
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
