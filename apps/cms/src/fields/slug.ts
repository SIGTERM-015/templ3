import type { Field } from 'payload'

type SlugFieldOptions = {
  source?: string
}

export const slugField = ({ source = 'title' }: SlugFieldOptions = {}): Field => ({
  name: 'slug',
  type: 'text',
  admin: {
    position: 'sidebar',
  },
  hooks: {
    beforeValidate: [
      ({ data, operation, value }) => {
        if (typeof value === 'string' && value.trim()) return value
        if (operation !== 'create' && !data?.[source]) return value

        const candidate = String(data?.[source] ?? '')
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')

        return candidate
      },
    ],
  },
  index: true,
  label: 'Slug',
  required: true,
  unique: true,
})
