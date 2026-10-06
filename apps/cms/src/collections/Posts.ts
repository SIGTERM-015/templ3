import type { CollectionConfig } from 'payload'

import { slugField } from '../fields/slug'
import { editorWrites, publishedOrAuthenticated } from '../access'
import { safeUrl } from '../fields/url'

export const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    read: publishedOrAuthenticated,
    ...editorWrites,
  },
  admin: {
    defaultColumns: ['title', '_status', 'publishedAt', 'updatedAt'],
    useAsTitle: 'title',
  },
  defaultSort: '-publishedAt',
  // Ghost-style layout: the main column is just the title and the writing canvas;
  // everything about the post (URL, excerpt, image, taxonomy, SEO) lives in the sidebar.
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        placeholder: 'Post title',
        components: {
          Field: '/components/PostTitleField#PostTitleField',
        },
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      label: false,
    },
    slugField(),
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      maxLength: 240,
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Shown on cards and in link previews (max 240).',
      },
    },
    {
      name: 'heroImage',
      label: 'Feature image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      hasMany: true,
      relationTo: 'tags',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'seo',
      label: 'SEO',
      type: 'group',
      admin: {
        position: 'sidebar',
      },
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          maxLength: 160,
        },
        {
          name: 'canonicalUrl',
          type: 'text',
          validate: safeUrl(['https:', 'http:']),
        },
      ],
    },
  ],
  versions: {
    drafts: {
      // Saves the draft as you type, like Ghost; publishing stays an explicit action
      autosave: { interval: 1500 },
    },
  },
}
