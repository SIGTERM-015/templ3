import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    useAPIKey: true,
  },
  fields: [
    {
      name: 'displayName',
      type: 'text',
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Profile photo displayed on the site',
      },
    },
    {
      name: 'handle',
      type: 'text',
      defaultValue: 'sigterm015',
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'admin',
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Editor',
          value: 'editor',
        },
        {
          label: 'API',
          value: 'api',
        },
      ],
      required: true,
    },
  ],
}
