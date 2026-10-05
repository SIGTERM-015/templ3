import type { CollectionConfig } from 'payload'

import { isAuthenticated, isEditor } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true, // Public so the site can serve images to users directly
    create: isAuthenticated, // The site's api key uploads guestbook drawings
    update: isEditor,
    delete: isEditor,
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
