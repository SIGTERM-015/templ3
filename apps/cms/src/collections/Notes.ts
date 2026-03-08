import type { CollectionConfig } from 'payload'

import { slugField } from '../fields/slug'
import { createPurgeHook } from '../hooks/purgeCache'

export const Notes: CollectionConfig = {
  slug: 'notes',
  access: {
    read: ({ req: { user } }) => {
      if (user) return true
      return { _status: { equals: 'published' } }
    },
  },
  hooks: {
    afterChange: [createPurgeHook()],
  },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'filename', 'publishedAt', '_status'],
    description: 'Markdown files shown as a folder on the desktop',
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
      name: 'filename',
      type: 'text',
      required: true,
      admin: {
        description: 'Filename shown on the desktop (e.g. "readme.md", "notes.md")',
        placeholder: 'my-note.md',
      },
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Plain markdown text. Rendered in the Notes desktop app.',
        rows: 20,
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'Date shown next to the filename on the desktop',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Sort order in the desktop folder (lower = first)',
      },
    },
  ],
  versions: {
    drafts: true,
  },
}
