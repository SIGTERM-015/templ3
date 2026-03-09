import type { CollectionConfig } from 'payload'

export const ProjectStatuses: CollectionConfig = {
  slug: 'project-statuses',
  access: {
    read: ({ req: { user } }) => Boolean(user),
  },
  admin: {
    group: 'Config',
    useAsTitle: 'label',
    defaultColumns: ['label', 'value', 'color', 'order'],
    description: 'Status definitions for Projects — controls label, color, and icon',
  },
  defaultSort: 'order',
  fields: [
    {
      name: 'value',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description:
          'Slug key used in Project entries (e.g. "active", "building", "planned", "concept", "archived")',
      },
    },
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name shown on project cards (e.g. "Active", "Building")',
      },
    },
    {
      name: 'color',
      type: 'text',
      admin: {
        description:
          'CSS color value for this status badge (e.g. "oklch(72% 0.14 80)" or "#4ade80")',
        placeholder: 'oklch(72% 0.14 80)',
      },
    },
    {
      name: 'icon',
      type: 'relationship',
      relationTo: 'media',
      admin: {
        description: 'Image icon for this status (preferred over glyph)',
      },
    },
    {
      name: 'glyph',
      type: 'text',
      admin: {
        description: 'ASCII/symbol fallback if no icon image (e.g. "●", "◐", "○")',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      required: true,
      admin: {
        description: 'Sort order (lower = first)',
      },
    },
  ],
}
