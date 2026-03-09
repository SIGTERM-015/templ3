import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
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

const resolveEnv = async (key: string) => {
  // @ts-expect-error - cloudflare context is not fully typed yet
  const value = cloudflare?.env?.[key]
  if (value && typeof value === 'object' && 'get' in value) {
    return await value.get()
  }
  return (value as string) || process.env[key]
}

const payloadSecret = process.env.PAYLOAD_SECRET || await resolveEnv('PAYLOAD_SECRET') || ''
const databaseUrl = process.env.DATABASE_URL || await resolveEnv('DATABASE_URL') || ''
const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || await resolveEnv('NEXT_PUBLIC_SERVER_URL') || undefined
const smtpHost = process.env.SMTP_HOST || await resolveEnv('SMTP_HOST') || undefined
const smtpPort = process.env.SMTP_PORT || await resolveEnv('SMTP_PORT') || 587
const smtpUser = process.env.SMTP_USER || await resolveEnv('SMTP_USER') || undefined
const smtpPass = process.env.SMTP_PASS || await resolveEnv('SMTP_PASS') || undefined
const smtpFrom = process.env.SMTP_FROM || await resolveEnv('SMTP_FROM') || 'cms@sigterm.vodka'

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
      maxUses: process.env.NODE_ENV === 'production' ? 1 : undefined,
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
