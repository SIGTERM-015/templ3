export const site = {
  name: 'Templ3',
  domain: 'sigterm.vodka',
  email: 'hello@sigterm.vodka',
  description: 'Sigterm\'s personal web: DevSecOps, hacking, hardware, AI, and a retro cyberpunk aesthetic.',
  lang: 'en',
  wallpaper: 'wallpaper.webp' as string,
}

export const operator = {
  handle: 'Sigterm',
  aliases: ['Sigterm015', 'SIGTERM-015'],
  role: 'DevSecOps / DevOps / Pentester',
  specialty: 'Cloud Infrastructure, Pentesting, Hardware',
  status: 'ACTIVE' as const,
  avatar: '/pic.webp',
  claim: 'Architecting secure cloud environments, breaking systems, and hacking stuff.',
  intro: 'Cloud infrastructure, offensive security, hacking stuff, and a retro-cyberpunk terminal aesthetic.',
  bio: [
    'Hy!!! Hello!!! :3',
    'I\'m Sigterm!!! welcome to my website!!!',
    'As you can imagine, i am a nerd, i love computers, hacking, and tinkering with stuff.',
    'I work as a DevSecOps but im getting into pentesting and cibersecurity lately with already 2 bounties claimed.',
  ]
}

export type SocialLink = {
  id: string
  label: string
  href: string
  platform: string
  description: string
  icon: string
  logo?: string
}

export const socialLinks: SocialLink[] = [
  {
    id: 'github',
    label: 'GitHub',
    href: 'https://github.com/SIGTERM-015',
    platform: 'Code forge',
    description: 'Repos, labs, automations, and security experiments.',
    icon: '{}',
    logo: '/logos/github.svg',
  },
  {
    id: 'twitter',
    label: 'X / Twitter',
    href: 'https://x.com/SIGTERM015',
    platform: 'Microblogging',
    description: 'Me being silly, programming related rants, and shitposting.',
    icon: 'X',
    logo: '/logos/twitter.svg',
  },
  {
    id: 'email',
    label: 'Email',
    href: 'mailto:me@sigterm.vodka',
    platform: 'Direct line',
    description: 'Channel for opportunities, inquiries, or interesting ideas.',
    icon: '@',
    logo: '/logos/email.svg',
  },
]

export const inspirations = [
  'Cyberpunk 2077', 'Fallout', 'Project Zomboid', 'Bitburner',
  "Baldur's Gate 3", 'anime and manga', 'cute things', 'zombie fiction',
  'TempleOS', 'soviet aesthetic', 'post-apocalyptic', 'linux', 'open source',
]

export const navGuide = {
  title: 'README.txt — How to navigate Templ3',
  lines: [
    'Welcome to TEMPL3 OS v0.6.6.6',
    '',
    'This is Sigterm\'s digital sanctuary.',
    'The web works like a computer desktop:',
    '',
    '  - Double click icons to open applications.',
    '  - You can have multiple windows open at once.',
    '  - Drag windows by their title bar.',
    '  - Resize from the bottom right corner.',
    '  - [_] minimize, [□] maximize, [✕] close.',
    '',
    'Available applications:',
    '  dossier    → Profile / About',
    '  gazette    → Blog / Writeups',
    '  armory     → Projects / Arsenal',
    '  media      → Media Log',
    '  comms      → Links / Contact',
    '  terminal   → Command line',
    '',
    'Open terminal with Ctrl+` at any time.',
    'Type "help" to see available commands.',
    '',
    '// sigterm.vodka — edge deployed',
  ],
}

export type DesktopApp = {
  id: string
  route: string
  glyph: string
  label: string
  windowTitle: string
  defaultSize?: { w: number; h: number }
  defaultPos?: { x: number; y: number }
  svgIcon?: string   // optional inline SVG string — overrides glyph in desktop icons
}

export const desktopApps: DesktopApp[] = [
  { id: 'dossier', route: '/', glyph: '//', label: 'dossier', windowTitle: 'DOSSIER', defaultSize: { w: 70, h: 85 }, defaultPos: { x: 15, y: 5 } },
  { id: 'gazette', route: '/blog', glyph: '>>', label: 'gazette', windowTitle: 'GAZETTE', defaultSize: { w: 80, h: 88 }, defaultPos: { x: 10, y: 4 } },
  { id: 'armory', route: '/arsenal', glyph: '{}', label: 'armory', windowTitle: 'ARMORY', defaultSize: { w: 72, h: 82 }, defaultPos: { x: 14, y: 6 } },
  { id: 'media', route: '/media', glyph: '♪', label: 'media', windowTitle: 'MEDIA', defaultSize: { w: 68, h: 80 }, defaultPos: { x: 18, y: 6 } },
  { id: 'comms', route: '/links', glyph: '::', label: 'comms', windowTitle: 'COMMS', defaultSize: { w: 55, h: 75 }, defaultPos: { x: 22, y: 8 } },
  {
    id: 'notes',
    route: '/notes',
    glyph: '//',
    label: 'notes',
    windowTitle: 'NOTES',
    defaultSize: { w: 62, h: 78 },
    defaultPos: { x: 19, y: 7 },
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h3.5l2 2H19a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
  },
  { id: 'readme', route: '', glyph: '[]', label: 'readme', windowTitle: 'README', defaultSize: { w: 42, h: 55 }, defaultPos: { x: 52, y: 12 } },
  { id: 'settings', route: '', glyph: '::', label: 'settings', windowTitle: 'SETTINGS', defaultSize: { w: 58, h: 72 }, defaultPos: { x: 20, y: 10 } },
]

export const statusColors: Record<string, string> = {
  active: 'oklch(72% 0.14 80)',
  building: 'oklch(72% 0.18 345)',
  planned: 'oklch(65% 0.02 60)',
  archived: 'oklch(45% 0.02 55)',
  concept: 'oklch(42% 0.08 145)',
}
