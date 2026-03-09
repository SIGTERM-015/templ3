import type { GlobalConfig } from 'payload'

export const SiteIdentity: GlobalConfig = {
  slug: 'site-identity',
  access: {
    read: ({ req: { user } }) => Boolean(user),
  },
  admin: {
    group: 'Site',
    description: 'Global site identity, operator profile, and terminal config',
  },
  fields: [
    // ── Site metadata ──────────────────────────────────────────────
    {
      name: 'siteName',
      type: 'text',
      defaultValue: 'Templ3',
      admin: { description: 'Used in page titles and OG tags' },
    },
    {
      name: 'siteDomain',
      type: 'text',
      defaultValue: 'sigterm.vodka',
    },
    {
      name: 'siteEmail',
      type: 'email',
      defaultValue: 'hello@sigterm.vodka',
    },
    {
      name: 'siteDescription',
      type: 'textarea',
      defaultValue: "Sigterm's personal web: DevSecOps, hacking, hardware, AI, and a retro cyberpunk aesthetic.",
      admin: { description: 'Default meta description for the site' },
    },
    {
      name: 'wallpaper',
      type: 'relationship',
      relationTo: 'media',
      admin: { description: 'Default desktop wallpaper image' },
    },

    // ── Operator profile ──────────────────────────────────────────
    {
      name: 'handle',
      type: 'text',
      defaultValue: 'Sigterm',
    },
    {
      name: 'aliases',
      type: 'array',
      admin: { description: 'Alternative handles / usernames' },
      fields: [
        {
          name: 'alias',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'role',
      type: 'text',
      defaultValue: 'DevSecOps / DevOps / Pentester',
    },
    {
      name: 'specialty',
      type: 'text',
      defaultValue: 'Cloud Infrastructure, Pentesting, Hardware',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Away', value: 'away' },
        { label: 'Inactive', value: 'inactive' },
      ],
    },
    {
      name: 'claim',
      type: 'text',
      defaultValue: 'Architecting secure cloud environments, breaking systems, and hacking stuff.',
      admin: { description: 'Short tagline shown in profile' },
    },
    {
      name: 'intro',
      type: 'textarea',
      defaultValue: 'Cloud infrastructure, offensive security, hacking stuff, and a retro-cyberpunk terminal aesthetic.',
      admin: { description: 'One-line intro shown in dossier header' },
    },
    {
      name: 'bio',
      type: 'array',
      admin: { description: 'Bio paragraphs shown in the dossier app' },
      fields: [
        {
          name: 'paragraph',
          type: 'textarea',
          required: true,
        },
      ],
    },
    {
      name: 'avatar',
      type: 'relationship',
      relationTo: 'media',
      admin: { description: 'Profile photo shown in dossier' },
    },
    {
      name: 'inspirations',
      type: 'array',
      admin: { description: 'Tags shown in the Inspirations section of dossier' },
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },

    // ── README / NavGuide ─────────────────────────────────────────
    {
      name: 'navGuideTitle',
      type: 'text',
      defaultValue: 'README.txt — How to navigate Templ3',
      admin: { description: 'Title shown at the top of the README window' },
    },
    {
      name: 'navGuideLines',
      type: 'array',
      admin: { description: 'Lines of text shown in the README.txt desktop app' },
      fields: [
        {
          name: 'line',
          type: 'text',
          // allow empty strings for blank lines
        },
      ],
    },

    // ── Terminal config ───────────────────────────────────────────
    {
      name: 'terminalPrompt',
      type: 'text',
      defaultValue: 'sigterm@templ3:~$',
      admin: { description: 'Shell prompt string shown in the terminal' },
    },
    {
      name: 'terminalPwd',
      type: 'text',
      defaultValue: '/home/sigterm',
      admin: { description: 'Output of the `pwd` command' },
    },
    {
      name: 'terminalUname',
      type: 'text',
      defaultValue: 'Templ3 OS 0.6.6.6 sigterm-sanctum x86_64 GNU/Linux',
      admin: { description: 'Output of the `uname -a` command' },
    },
    {
      name: 'whoamiOutput',
      type: 'textarea',
      defaultValue:
        'Handle:    Sigterm / Sigterm015\nRole:      DevSecOps → Red Team\nStatus:    ACTIVE\nSpecialty: Pentesting, Bug Bounty, Automation\nDomain:    sigterm.vodka\nCodename:  Templ3',
      admin: {
        description: 'Full text block output of the `whoami` terminal command',
        style: {
          fontFamily: 'Consolas, "SF Mono", "Liberation Mono", monospace',
        },
      },
    },
    {
      name: 'neofetchOutput',
      type: 'code',
      admin: {
        language: 'plaintext',
        description:
          'Full neofetch-style ASCII art output. Leave empty to use the default. Use a strict monospace font for proper alignment.',
      },
    },
  ],
}
