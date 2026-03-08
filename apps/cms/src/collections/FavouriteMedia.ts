import type { CollectionConfig } from 'payload'

import { slugField } from '../fields/slug'
import { createPurgeHook } from '../hooks/purgeCache'

export const FavouriteMedia: CollectionConfig = {
  slug: 'favourite-media',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [createPurgeHook()],
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'mediaType', 'rating', '_status'],
  },
  defaultSort: '-completedAt',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField(),
    {
      name: 'mediaType',
      type: 'select',
      required: true,
      options: [
        { label: 'Anime', value: 'anime' },
        { label: 'Manga', value: 'manga' },
        { label: 'Game', value: 'game' },
        { label: 'Movie', value: 'movie' },
        { label: 'Series', value: 'series' },
        { label: 'Book', value: 'book' },
        { label: 'Music', value: 'music' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'progress',
      label: 'Status',
      type: 'select',
      required: true,
      defaultValue: 'completed',
      options: [
        { label: 'Completed', value: 'completed' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Dropped', value: 'dropped' },
        { label: 'Plan to Start', value: 'planned' },
      ],
    },
    {
      name: 'rating',
      type: 'number',
      min: 1,
      max: 10,
      admin: {
        description: 'Rating from 1 to 10',
      },
    },
    {
      name: 'review',
      type: 'textarea',
      admin: {
        description: 'Short review or thoughts',
      },
    },
    {
      name: 'coverImage',
      type: 'relationship',
      relationTo: 'media',
    },
    {
      name: 'blogPost',
      type: 'relationship',
      relationTo: 'posts',
      admin: {
        description: 'Link to a blog post with a full review',
      },
    },
    {
      name: 'externalReviewUrl',
      type: 'text',
      admin: {
        description: 'Link to a review on a third-party site (MAL, Steam, Letterboxd, etc.)',
      },
    },
    {
      name: 'completedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'When you finished / last interacted with it',
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
  ],
  versions: {
    drafts: true,
  },
}
