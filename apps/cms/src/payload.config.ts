import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import {
  BlocksFeature,
  CodeBlock,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import {
  BookmarkBlock,
  CalloutBlock,
  CodePenBlock,
  DividerBlock,
  GitHubGistBlock,
  SpotifyBlock,
  TwitterBlock,
  VideoBlock,
  YouTubeBlock,
} from './blocks/embeds'
import { r2Storage } from '@payloadcms/storage-r2'
import fs from 'fs'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { payloadTotp } from 'payload-totp'
import { CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare'

import { Categories } from './collections/Categories'
import { FavouriteMedia } from './collections/FavouriteMedia'
import { Links } from './collections/Links'
import { MediaStatuses } from './collections/MediaStatuses'
import { MediaTypes } from './collections/MediaTypes'
import { Notes } from './collections/Notes'
import { ProjectStatuses } from './collections/ProjectStatuses'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { Projects } from './collections/Projects'
import { Tags } from './collections/Tags'
import { WebApps } from './collections/WebApps'
import { SiteIdentity } from './globals/SiteIdentity'
import { mediaLookupEndpoint } from './endpoints/media-lookup'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const realpath = (value: string) => (fs.existsSync(value) ? fs.realpathSync(value) : undefined)
const isCLI = process.argv.some((value) => realpath(value)?.endsWith(path.join('payload', 'bin.js')))
const isProduction = process.env.NODE_ENV === 'production'

const createLog =
  (level: string, fn: typeof console.log) => (objOrMsg: object | string, msg?: string) => {
    if (typeof objOrMsg === 'string') {
      fn(JSON.stringify({ level, msg: objOrMsg }))
    } else {
      fn(JSON.stringify({ level, ...objOrMsg, msg: msg ?? (objOrMsg as { msg?: string }).msg }))
    }
  }

const cloudflareLogger = {
  level: process.env.PAYLOAD_LOG_LEVEL || 'info',
  trace: createLog('trace', console.debug),
  debug: createLog('debug', console.debug),
  info: createLog('info', console.log),
  warn: createLog('warn', console.warn),
  error: createLog('error', console.error),
  fatal: createLog('fatal', console.error),
  silent: () => {},
} as unknown as import('payload').PayloadLogger

function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`).then(
    ({ getPlatformProxy }) =>
      getPlatformProxy({
        environment: process.env.CLOUDFLARE_ENV,
        remoteBindings: isProduction,
      }),
  )
}

const cloudflare =
  isCLI || !isProduction
    ? await getCloudflareContextFromWrangler()
    : await getCloudflareContext({ async: true })

const payloadSecret = process.env.PAYLOAD_SECRET || ''
// In production, use Hyperdrive connectionString; in dev, use DATABASE_URL from env
const databaseUrl = (isProduction && cloudflare?.env?.HYPERDRIVE?.connectionString)
  ? cloudflare.env.HYPERDRIVE.connectionString
  : process.env.DATABASE_URL || ''
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || undefined
const smtpHost = process.env.SMTP_HOST || undefined
const smtpPort = process.env.SMTP_PORT || 587
const smtpUser = process.env.SMTP_USER || undefined
const smtpPass = process.env.SMTP_PASS || undefined
const smtpFrom = process.env.SMTP_FROM || 'cms@sigterm.vodka'

export default buildConfig({
  admin: {
    meta: {
      description: 'Templ3 CMS for sigterm.vodka',
      title: 'Templ3 CMS',
      titleSuffix: ' — Templ3',
    },
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      graphics: {
        Logo: { path: '/graphics/Logo.tsx', exportName: 'Logo' },
        Icon: { path: '/graphics/Icon.tsx', exportName: 'Icon' },
      },
    },
  },
  collections: [
    Users,
    Media,
    Tags,
    Categories,
    Posts,
    Projects,
    Links,
    FavouriteMedia,
    Notes,
    WebApps,
    MediaTypes,
    MediaStatuses,
    ProjectStatuses,
  ],
  globals: [SiteIdentity],
  endpoints: [mediaLookupEndpoint],
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
      FixedToolbarFeature(),
      HorizontalRuleFeature(),
      BlocksFeature({
        blocks: [
          // Code with syntax highlighting
          CodeBlock({
            defaultLanguage: 'typescript',
            languages: {
              plaintext: 'Plain Text',
              bash: 'Bash',
              sh: 'Shell',
              yaml: 'YAML',
              json: 'JSON',
              html: 'HTML',
              css: 'CSS',
              javascript: 'JavaScript',
              typescript: 'TypeScript',
              tsx: 'TSX',
              jsx: 'JSX',
              python: 'Python',
              go: 'Go',
              rust: 'Rust',
              sql: 'SQL',
              dockerfile: 'Dockerfile',
              markdown: 'Markdown',
            },
          }),
          // Embeds
          YouTubeBlock,
          SpotifyBlock,
          TwitterBlock,
          GitHubGistBlock,
          CodePenBlock,
          VideoBlock,
          // Content blocks
          CalloutBlock,
          DividerBlock,
          BookmarkBlock,
        ],
      }),
    ],
  }),
  serverURL: serverUrl,
  secret: payloadSecret,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  logger: isProduction ? cloudflareLogger : undefined,
  email: smtpHost
    ? nodemailerAdapter({
        defaultFromAddress: smtpFrom,
        defaultFromName: 'Templ3 CMS',
        transportOptions: {
          host: smtpHost,
          port: Number(smtpPort) || 587,
          auth: smtpUser
            ? {
                user: smtpUser,
                pass: smtpPass,
              }
            : undefined,
        },
      })
    : undefined,
  db: postgresAdapter({
    push: process.env.NODE_ENV !== 'production',
    pool: {
      connectionString: databaseUrl,
      // In Cloudflare Workers, connections cannot be reused across requests
      // maxUses: 1 ensures each connection is used only once then discarded
      ...(isProduction && { maxUses: 1 }),
    },
  }),
  plugins: [
    r2Storage({
      enabled: Boolean(cloudflare?.env?.R2),
      collections: {
        media: {
          prefix: 'templ3/media',
        },
      },
      // Using binding if available
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      bucket: (cloudflare?.env?.R2 || null) as any,
    }),
    payloadTotp({ collection: 'users', disableAccessWrapper: true }),
  ],
})
