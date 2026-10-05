import type { CollectionConfig } from 'payload'

import { slugField } from '../fields/slug'
import { editorWrites, isAuthenticated } from '../access'

export const Tags: CollectionConfig = {
  slug: 'tags',
  access: {
    read: isAuthenticated,
    ...editorWrites,
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
