import type { CollectionConfig } from 'payload'

import { slugField } from '../fields/slug'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    slugField({ source: 'name' }),
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Optional description shown in the gazette sidebar',
      },
    },
    {
      name: 'icon',
      type: 'relationship',
      relationTo: 'media',
      admin: {
        description: 'Image icon shown in the sidebar folder',
      },
    },
  ],
}
