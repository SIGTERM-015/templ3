import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { r2Storage } from '@payloadcms/storage-r2'
import fs from 'fs'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { payloadTotp } from 'payload-totp'
import sharp from 'sharp'
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
import { SiteIdentity } from './globals/SiteIdentity'

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
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`)
    .then(({ getPlatformProxy }) =>
      getPlatformProxy({
        environment: process.env.CLOUDFLARE_ENV,
        remoteBindings: isProduction,
      }),
    )
    .catch(() => ({ env: {} as CloudflareContext['env'] } as CloudflareContext))
}

const getCloudflare = async (): Promise<CloudflareContext> => {
  if (isCLI) return { env: {} as CloudflareContext['env'] } as CloudflareContext
  try {
    if (!isProduction) {
      return await getCloudflareContextFromWrangler()
    }
    return await getCloudflareContext({ async: true })
  } catch (_err) {
    // This is expected during build when miniflare tries to load deleted_classes without the class present
    console.warn('Skipping Cloudflare context (expected during build)')
    return { env: {} as CloudflareContext['env'] } as CloudflareContext
  }
}

const cloudflare = await getCloudflare()

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
    MediaTypes,
    MediaStatuses,
    ProjectStatuses,
  ],
  globals: [SiteIdentity],
  editor: lexicalEditor(),
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  logger: isProduction ? cloudflareLogger : undefined,
  email: process.env.SMTP_HOST
    ? nodemailerAdapter({
        defaultFromAddress: process.env.SMTP_FROM || 'cms@sigterm.vodka',
        defaultFromName: 'Templ3 CMS',
        transportOptions: {
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          auth: process.env.SMTP_USER
            ? {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
              }
            : undefined,
        },
      })
    : undefined,
  db: postgresAdapter({
    push: process.env.NODE_ENV !== 'production',
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      maxUses: process.env.NODE_ENV === 'production' ? 1 : undefined,
    },
  }),
  sharp: sharp as unknown as NonNullable<import('payload').Config['sharp']>,
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
