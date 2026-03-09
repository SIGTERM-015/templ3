import type { CollectionConfig } from 'payload'

import { slugField } from '../fields/slug'

export const Projects: CollectionConfig = {
  slug: 'projects',
  access: {
    read: ({ req: { user } }) => {
      if (user) return true
      return { _status: { equals: 'published' } }
    },
  },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'projectStatus', 'featured', '_status'],
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
      type: 'relationship',
      relationTo: 'project-statuses',
      required: true,
      admin: {
        description: 'Project status (configured in Project Statuses)',
      },
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
