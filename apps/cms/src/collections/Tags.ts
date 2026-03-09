import type { CollectionConfig } from 'payload'

import { slugField } from '../fields/slug'

export const Tags: CollectionConfig = {
  slug: 'tags',
  access: {
    read: ({ req: { user } }) => Boolean(user),
  },
  admin: {
    useAsTitle: 'name',
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
    },
    {
      name: 'color',
      type: 'text',
      defaultValue: '#b00b69',
    },
  ],
}
