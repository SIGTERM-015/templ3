import type { CollectionConfig } from 'payload'

export const Links: CollectionConfig = {
  slug: 'links',
  access: {
    read: () => true,
  },
  admin: {
    defaultColumns: ['label', 'platform', 'featured'],
    useAsTitle: 'label',
  },
  defaultSort: 'platform',
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
    },
    {
      name: 'platform',
      type: 'text',
      required: true,
    },
    {
      name: 'href',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'icon',
      type: 'text',
      admin: {
        description: 'ASCII/emoji fallback when no logo is set (e.g. "{}", "@", "in")',
      },
    },
    {
      name: 'logo',
      type: 'relationship',
      relationTo: 'media',
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
