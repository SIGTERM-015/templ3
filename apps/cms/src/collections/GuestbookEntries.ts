import type { CollectionConfig } from 'payload'

export const GuestbookEntries: CollectionConfig = {
  slug: 'guestbook-entries',
  access: {
    // Both admin and API can read approved. Admin can read all.
    read: ({ req: { user } }) => {
      if (!user) return false // Deny unauthenticated
      if (user.role === 'admin' || user.role === 'editor') return true
      return { status: { equals: 'approved' } }
    },
    // Both admin and API can create
    create: ({ req: { user } }) => Boolean(user),
    // Only admins/editors can update/delete
    update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'editor',
    delete: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'editor',
  },
  admin: {
    group: 'Content',
    useAsTitle: 'message',
    defaultColumns: ['message', 'authorName', 'status', 'createdAt'],
    description: 'Guestbook entries submitted by visitors. Approve to display on the site.',
  },
  defaultSort: '-createdAt',
  fields: [
    {
      name: 'message',
      label: 'Title',
      type: 'text', // Using text instead of textarea is usually better for titles, but since it's already created as textarea I'll keep it, or change it? The user picture shows a textarea but if it's a title, maybe text is better. The image shows a textarea (multiline). I'll keep textarea but change label.
      required: true,
      admin: {
        description: 'Title of the entry',
      },
    },
    // ── Author info (from Discord OAuth via Clerk) ──
    {
      name: 'authorName',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name from Discord',
      },
    },
    {
      name: 'authorAvatar',
      type: 'text',
      admin: {
        description: 'Avatar URL from Discord',
      },
    },
    {
      name: 'authorDiscordId',
      type: 'text',
      admin: {
        description: 'Discord user ID (for deduplication/banning)',
        position: 'sidebar',
      },
      index: true,
    },
    {
      name: 'clerkUserId',
      type: 'text',
      admin: {
        description: 'Clerk user ID',
        position: 'sidebar',
      },
      index: true,
    },

    // ── Entry content ──
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'The canvas image (exported PNG from Excalidraw)',
      },
    },

    // ── Optional embed ──
    {
      name: 'embedUrl',
      type: 'text',
      admin: {
        description: 'Optional Spotify or YouTube URL to embed alongside the entry',
      },
    },
    {
      name: 'embedType',
      type: 'select',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Spotify', value: 'spotify' },
        { label: 'YouTube', value: 'youtube' },
      ],
      defaultValue: 'none',
      admin: {
        description: 'Auto-detected from embedUrl, or set manually',
        position: 'sidebar',
      },
    },

    // ── Moderation ──
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
      defaultValue: 'pending',
      required: true,
      admin: {
        position: 'sidebar',
        description: 'Only approved entries are visible on the site',
      },
      index: true,
    },
  ],
}
