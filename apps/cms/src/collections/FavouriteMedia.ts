import type { CollectionConfig } from 'payload'

import { slugField } from '../fields/slug'

export const FavouriteMedia: CollectionConfig = {
  slug: 'favourite-media',
  labels: {
    singular: 'Media',
    plural: 'Media',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true
      return { _status: { equals: 'published' } }
    },
  },
  admin: {
    group: 'Content',
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
    {
      name: 'creator',
      type: 'text',
      admin: {
        description: 'Author, artist, studio, or developer (shown on Now cards)',
      },
    },
    slugField(),
    {
      name: 'mediaType',
      type: 'relationship',
      relationTo: 'media-types',
      required: true,
      admin: {
        description: 'Type of media (configured in Media Types)',
      },
    },
    {
      name: 'mediaLookup',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/MediaLookupField',
        },
      },
    },
    {
      name: 'progress',
      label: 'Status',
      type: 'relationship',
      relationTo: 'media-statuses',
      required: true,
      admin: {
        description: 'Current progress/status (configured in Media Statuses)',
      },
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
      name: 'externalCoverUrl',
      type: 'text',
      admin: {
        description: 'Cover image URL from external API (used if no uploaded cover)',
      },
    },
    {
      name: 'externalId',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'ID from external API (IGDB, TMDB, AniList, etc.)',
        readOnly: true,
      },
    },
    {
      name: 'externalSource',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Source API (igdb, tmdb, anilist, etc.)',
        readOnly: true,
      },
    },
    {
      name: 'externalUrl',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Link to the item on the external site',
        readOnly: true,
      },
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
