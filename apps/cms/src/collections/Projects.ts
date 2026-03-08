import type { CollectionConfig } from 'payload'

import { slugField } from '../fields/slug'
import { createPurgeHook } from '../hooks/purgeCache'

export const Projects: CollectionConfig = {
  slug: 'projects',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [createPurgeHook()],
  },
  admin: {
    defaultColumns: ['title', 'projectStatus', 'featured', '_status'],
    useAsTitle: 'title',
  },
  defaultSort: 'order',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField(),
    {
      name: 'summary',
      type: 'textarea',
      required: true,
    },
    {
      name: 'projectStatus',
      type: 'select',
      defaultValue: 'building',
      options: [
        { label: 'Building', value: 'building' },
        { label: 'Active', value: 'active' },
        { label: 'Planned', value: 'planned' },
        { label: 'Concept', value: 'concept' },
        { label: 'Archived', value: 'archived' },
      ],
      required: true,
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      required: true,
    },
    {
      name: 'stack',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'repositoryUrl',
      type: 'text',
    },
    {
      name: 'externalUrl',
      type: 'text',
    },
    {
      name: 'coverImage',
      type: 'relationship',
      relationTo: 'media',
    },
    {
      name: 'tags',
      type: 'relationship',
      hasMany: true,
      relationTo: 'tags',
    },
    {
      name: 'content',
      type: 'richText',
    },
  ],
  versions: {
    drafts: true,
  },
}
