import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true, // Public so the site can serve images to users directly
    create: ({ req: { user } }) => Boolean(user), // Let api, admin, editor create
    update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'editor',
    delete: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'editor',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'textarea',
    },
    {
      name: 'credit',
      type: 'text',
    },
  ],
  upload: {
    adminThumbnail: 'card',
    imageSizes: [
      {
        name: 'card',
        width: 720,
      },
      {
        name: 'hero',
        width: 1600,
      },
    ],
    mimeTypes: ['image/*'],
  },
}
