import type { CollectionConfig } from 'payload'

export const MediaTypes: CollectionConfig = {
  slug: 'media-types',
  access: {
    read: () => true,
  },
  admin: {
    group: 'Config',
    useAsTitle: 'label',
    defaultColumns: ['label', 'value', 'nowCategory', 'order'],
    description: 'Media type definitions: display label, icon, and "Now X" widget category',
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
          'Slug key — must match the value used in Favourite Media entries (e.g. "anime", "game", "book")',
      },
    },
    {
      name: 'label',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name shown in filters and cards (e.g. "Anime", "Games")',
      },
    },
    {
      name: 'icon',
      type: 'relationship',
      relationTo: 'media',
      admin: {
        description: 'Image icon shown in filters and cards (preferred over glyph)',
      },
    },
    {
      name: 'glyph',
      type: 'text',
      admin: {
        description: 'ASCII/text fallback if no icon image is set (e.g. ">>")',
      },
    },
    {
      name: 'nowCategory',
      type: 'select',
      defaultValue: 'none',
      required: true,
      options: [
        { label: 'None (do not show in Now section)', value: 'none' },
        { label: 'Now Watching', value: 'watching' },
        { label: 'Now Reading', value: 'reading' },
        { label: 'Now Playing', value: 'playing' },
        { label: 'Now Listening', value: 'listening' },
      ],
      admin: {
        description: 'Which "Now X" widget this media type belongs to on the media app',
      },
    },
    {
      name: 'nowLabel',
      type: 'text',
      admin: {
        description:
          'Custom label for the "Now X" widget (e.g. "Now watching"). Only used if nowCategory is not "none".',
      },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      required: true,
      admin: {
        description: 'Sort order in filter tabs (lower = first)',
      },
    },
  ],
}
