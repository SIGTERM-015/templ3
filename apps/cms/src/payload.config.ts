import { postgresAdapter } from '@payloadcms/db-postgres'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { payloadTotp } from 'payload-totp'
import sharp from 'sharp'

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
  email: nodemailerAdapter({
    defaultFromAddress: process.env.SMTP_FROM || 'cms@sigterm.vodka',
    defaultFromName: 'Templ3 CMS',
    transportOptions: {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
  }),
  db: postgresAdapter({
    push: true,
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp: sharp as any,
  plugins: [
    s3Storage({
      enabled: Boolean(
        process.env.R2_BUCKET &&
          process.env.R2_ACCESS_KEY_ID &&
          process.env.R2_SECRET_ACCESS_KEY &&
          process.env.R2_ENDPOINT,
      ),
      collections: {
        media: {
          prefix: 'templ3/media',
        },
      },
      bucket: process.env.R2_BUCKET || '',
      config: {
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
        endpoint: process.env.R2_ENDPOINT || '',
        forcePathStyle: true,
        region: process.env.R2_REGION || 'auto',
      },
    }),
    payloadTotp({ collection: 'users', disableAccessWrapper: true }),
  ],
})
