import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'displayName',
      type: 'text',
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
      ],
      required: true,
    },
  ],
}
