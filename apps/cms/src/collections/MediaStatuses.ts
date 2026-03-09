import type { CollectionConfig } from 'payload'

export const MediaStatuses: CollectionConfig = {
  slug: 'media-statuses',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Config',
    useAsTitle: 'label',
    defaultColumns: ['label', 'value', 'order'],
    description: 'Progress/status definitions for Favourite Media entries',
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
          'Slug key used in Favourite Media entries (e.g. "completed", "in-progress", "dropped", "planned")',
      },
    },
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name shown in tags and detail views (e.g. "Completed")',
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
        description: 'ASCII/symbol fallback if no icon image (e.g. "✓", "▶", "✕", "◌")',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      required: true,
      admin: {
        description: 'Sort order in status filters (lower = first)',
      },
    },
  ],
}
