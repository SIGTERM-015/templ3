import { desktopApps, operator } from '../../data/siteConfig'
import type { CmsSiteIdentity } from '../../lib/cms'
import { BSOD, BSOD_MOBILE, HELP_TABLE, NEOFETCH, NEOFETCH_MOBILE, NMAP_OUTPUT } from './ascii'

export type CommandResult = {
  output: string
  action?: 'clear' | 'exit' | 'navigate' | 'glitch' | 'bsod' | 'open_app' | 'open_url'
  navigateTo?: string
  appId?: string
  openUrl?: string
}

export type TerminalConfig = {
  siteIdentity?: CmsSiteIdentity | null
  webApps?: Array<{ slug: string; name: string }> | null
  isMobile?: boolean
}

// All available commands
const COMMANDS = [
  'help', 'whoami', 'neofetch', 'ls', 'cd', 'cat', 'secret', 'hack',
  'sudo', 'ping', 'nmap', 'clear', 'exit', 'echo', 'pwd', 'date', 'uname',
  'open', 'apps', 'goto', 'guestbook',
]

const HOME_FILES = [
  ...desktopApps.map(a => a.id),
  'terminal',
  'sigterm.txt',
]

/**
 * Get tab completion suggestions for the current input
 */
export function getCompletions(input: string, config?: TerminalConfig): string[] {
  const trimmed = input.trim()
  const parts = trimmed.split(/\s+/)
  const cmd = parts[0]?.toLowerCase() || ''
  const args = parts.slice(1)

  // If typing a ./ command, complete app names
  if (cmd.startsWith('./')) {
    const partial = cmd.slice(2).toLowerCase()
    const allApps = [...HOME_FILES.filter(f => f !== 'sigterm.txt')]
    if (config?.webApps) {
      allApps.push(...config.webApps.map(w => w.slug))
    }
    return allApps
      .filter(app => app.startsWith(partial))
      .map(app => `./${app}`)
  }

  // If no space yet, complete command names
  if (parts.length === 1 && !trimmed.endsWith(' ')) {
    return COMMANDS.filter(c => c.startsWith(cmd))
  }

  // Complete arguments for specific commands
  const lastArg = args[args.length - 1]?.toLowerCase() || ''

  switch (cmd) {
    case 'cat':
      return ['sigterm.txt'].filter(f => f.startsWith(lastArg))

    case 'open': {
      const allApps = [...desktopApps.map(a => a.id), 'terminal']
      if (config?.webApps) {
        allApps.push(...config.webApps.map(w => w.slug))
      }
      return allApps.filter(app => app.startsWith(lastArg))
    }

    case 'goto': {
      const routes = ['/', '/dossier', '/gazette', '/armory', '/media', '/comms', '/notes', '/guestbook', '/readme']
      return routes.filter(r => r.startsWith(lastArg))
    }

    case 'cd': {
      const dirs = ['~', '/', '.']
      return dirs.filter(d => d.startsWith(lastArg))
    }

    default:
      return []
  }
}

const RICKROLL_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ'

function fakePing(domain: string): string {
  const lines = []
  lines.push(`PING ${domain} (104.21.xx.xx) 56(84) bytes of data.`)
  for (let i = 0; i < 4; i++) {
    const ms = (Math.random() * 15 + 5).toFixed(1)
    lines.push(`64 bytes from ${domain}: icmp_seq=${i + 1} ttl=57 time=${ms} ms`)
  }
  lines.push('')
  lines.push(`--- ${domain} ping statistics ---`)
  lines.push('4 packets transmitted, 4 received, 0% packet loss')
  return lines.join('\n')
}

function formatLs(config?: TerminalConfig): string {
  const cols = [...HOME_FILES]
  // Add webApps to listing
  if (config?.webApps) {
    cols.push(...config.webApps.map(w => w.slug))
  }
  let out = ''
  const colWidth = 14
  for (let i = 0; i < cols.length; i++) {
    out += cols[i].padEnd(colWidth)
    if ((i + 1) % 4 === 0 && i < cols.length - 1) out += '\n'
  }
  return out
}

function formatApps(config?: TerminalConfig): string {
  const lines: string[] = ['Available applications:', '']
  
  // Built-in apps
  for (const app of desktopApps) {
    lines.push(`  ${app.id.padEnd(12)} ${app.label}`)
  }
  lines.push(`  ${'terminal'.padEnd(12)} Terminal`)
  
  // WebApps
  if (config?.webApps && config.webApps.length > 0) {
    lines.push('')
    lines.push('Web applications:')
    lines.push('')
    for (const app of config.webApps) {
      lines.push(`  ${app.slug.padEnd(12)} ${app.name}`)
    }
  }
  
  lines.push('')
  lines.push('Usage: open <app> or ./<app>')
  return lines.join('\n')
}

export function executeCommand(input: string, config?: TerminalConfig): CommandResult {
  const si = config?.siteIdentity

  // Resolved values: CMS-first, siteConfig fallback
  const handle = si?.handle ?? operator.handle
  const domain = si?.siteDomain ?? 'sigterm.vodka'
  const pwd = si?.terminalPwd ?? '/home/sigterm'
  const uname = si?.terminalUname ?? 'Templ3 OS 0.6.6.6 sigterm-sanctum x86_64 GNU/Linux'
  const siteName = si?.siteName ?? 'Templ3'

  const whoami = si?.whoamiOutput ??
    `Handle:    ${handle} / ${si?.aliases?.map(a => a.alias).join(' / ') ?? 'Sigterm015'}
Role:      ${si?.role ?? operator.role}
Status:    ${si?.status?.toUpperCase() ?? operator.status}
Specialty: ${si?.specialty ?? operator.specialty}
Domain:    ${domain}
Codename:  ${siteName}`

  const catSigterm = si?.bio?.length
    ? si.bio.map(b => b.paragraph).join('\n\n')
    : operator.bio.join('\n\n')

  // Use mobile-friendly ASCII art on smaller screens
  const defaultNeofetch = config?.isMobile ? NEOFETCH_MOBILE : NEOFETCH
  const neofetch = si?.neofetchOutput ? si.neofetchOutput : defaultNeofetch

  const bsodOutput = config?.isMobile ? BSOD_MOBILE : BSOD

  const trimmed = input.trim()
  const [cmd, ...args] = trimmed.split(/\s+/)
  const command = cmd?.toLowerCase() || ''

  if (command.startsWith('./')) {
    const appName = command.slice(2).toLowerCase()
    const app = desktopApps.find(a => a.id === appName)
    const webApp = config?.webApps?.find(w => w.slug === appName)
    if (appName === 'terminal') {
      return { output: 'Terminal is already running.' }
    }
    if (app) {
      return { output: `Starting ${appName}...`, action: 'open_app', appId: app.id }
    }
    if (webApp) {
      return { output: `Opening ${webApp.name}...`, action: 'open_app', appId: webApp.slug }
    }
    if (appName === 'sigterm.txt') {
      return { output: `bash: ./sigterm.txt: Permission denied. Try: cat sigterm.txt` }
    }
    return { output: `bash: ${command}: No such file or directory` }
  }

  switch (command) {
    case '':
      return { output: '' }

    case 'help':
      return { output: HELP_TABLE }

    case 'whoami':
      return { output: whoami }

    case 'neofetch':
      return { output: neofetch }

    case 'ls':
      return { output: formatLs(config) }

    case 'apps':
      return { output: formatApps(config) }

    case 'open': {
      const appName = args[0]?.toLowerCase()
      if (!appName) {
        return { output: 'Usage: open <app>\nType "apps" to see available applications.' }
      }
      if (appName === 'terminal') {
        return { output: 'Terminal is already running.' }
      }
      const app = desktopApps.find(a => a.id === appName)
      if (app) {
        return { output: `Opening ${app.label}...`, action: 'open_app', appId: app.id }
      }
      const webApp = config?.webApps?.find(w => w.slug === appName)
      if (webApp) {
        return { output: `Opening ${webApp.name}...`, action: 'open_app', appId: webApp.slug }
      }
      return { output: `open: ${appName}: Application not found. Type "apps" for list.` }
    }

    case 'goto': {
      const route = args[0]
      if (!route) {
        return { output: 'Usage: goto <route>\nExamples: goto /gazette, goto /dossier' }
      }
      const normalizedRoute = route.startsWith('/') ? route : `/${route}`
      return { output: `Navigating to ${normalizedRoute}...`, action: 'navigate', navigateTo: normalizedRoute }
    }

    case 'cd': {
      const target = args[0] || ''
      if (target === '' || target === '~' || target === '/' || target === '.') {
        return { output: '~' }
      }
      return { output: `cd: ${target}: Not a directory. Use ./<app> to run applications.` }
    }

    case 'cat':
      if (args[0] === 'sigterm' || args[0] === 'sigterm.txt') {
        return { output: catSigterm }
      }
      return { output: `cat: ${args[0] || ''}: No such file or directory` }

    case 'secret':
      return {
        output: '♪ Tuning into sanctum radio...',
        action: 'open_url',
        openUrl: RICKROLL_URL,
      }

    case 'hack':
      return { output: '> INITIATING GLITCH SEQUENCE...', action: 'glitch' }

    case 'sudo':
      if (args.join(' ') === 'rm -rf /') {
        return { output: bsodOutput, action: 'bsod' }
      }
      return { output: `sudo: ${args.join(' ')}: command not found` }

    case 'ping':
      return { output: fakePing(domain) }

    case 'nmap':
      return { output: NMAP_OUTPUT }

    case 'guestbook':
      return { output: 'Opening guestbook...', action: 'open_app', appId: 'guestbook' }

    case 'clear':
      return { output: '', action: 'clear' }

    case 'exit':
      return { output: 'Closing terminal...', action: 'exit' }

    case 'echo':
      return { output: args.join(' ') }

    case 'pwd':
      return { output: pwd }

    case 'date':
      return { output: new Date().toUTCString() }

    case 'uname':
      return { output: uname }

    default:
      return { output: `${command}: command not found. Type 'help' for available commands.` }
  }
}
