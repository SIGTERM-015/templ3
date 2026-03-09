import type { CollectionConfig } from 'payload'
import { slugField } from '../fields/slug'

export const WebApps: CollectionConfig = {
  slug: 'web-apps',
  access: {
    read: () => true,
  },
  admin: {
    defaultColumns: ['title', 'slug', 'url', 'enabled'],
    useAsTitle: 'title',
    description: 'External websites that appear as browser windows in the desktop',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Display name in the window title bar and app menu',
      },
    },
    slugField({ source: 'title' }),
    {
      name: 'url',
      type: 'text',
      required: true,
      admin: {
        description: 'Full URL to embed (e.g. https://cv.sigterm.vodka)',
      },
    },
    {
      name: 'icon',
      type: 'text',
      defaultValue: '◎',
      admin: {
        description: 'ASCII/emoji glyph for desktop icon and taskbar (e.g. "◎", "CV", "📄")',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Short description shown in tooltips or app menu',
      },
    },
    {
      name: 'defaultSize',
      type: 'group',
      admin: {
        description: 'Default window size as percentage of screen',
      },
      fields: [
        {
          name: 'width',
          type: 'number',
          defaultValue: 80,
          min: 30,
          max: 100,
          admin: {
            description: 'Width in % (30-100)',
          },
        },
        {
          name: 'height',
          type: 'number',
          defaultValue: 85,
          min: 30,
          max: 100,
          admin: {
            description: 'Height in % (30-100)',
          },
        },
      ],
    },
    {
      name: 'showAddressBar',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Show the browser address bar with the URL',
      },
    },
    {
      name: 'showInDesktop',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Show as a desktop icon',
      },
    },
    {
      name: 'showInMenu',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Show in the mobile app menu',
      },
    },
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Enable/disable this web app',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 100,
      admin: {
        description: 'Lower numbers appear first in lists',
      },
    },
  ],
}
