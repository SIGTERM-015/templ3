import { desktopApps, operator } from '../../data/siteConfig'
import type { CmsSiteIdentity } from '../../lib/cms'
import { BSOD, HELP_TABLE, NEOFETCH, NMAP_OUTPUT } from './ascii'

export type CommandResult = {
  output: string
  action?: 'clear' | 'exit' | 'navigate' | 'glitch' | 'bsod' | 'open_app' | 'open_url'
  navigateTo?: string
  appId?: string
  openUrl?: string
}

export type TerminalConfig = {
  siteIdentity?: CmsSiteIdentity | null
}

const HOME_FILES = [
  ...desktopApps.map(a => a.id),
  'terminal',
  'sigterm.txt',
]

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

function formatLs(): string {
  const cols = [...HOME_FILES]
  let out = ''
  const colWidth = 14
  for (let i = 0; i < cols.length; i++) {
    out += cols[i].padEnd(colWidth)
    if ((i + 1) % 4 === 0 && i < cols.length - 1) out += '\n'
  }
  return out
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

  const neofetch = si?.neofetchOutput ? si.neofetchOutput : NEOFETCH

  const trimmed = input.trim()
  const [cmd, ...args] = trimmed.split(/\s+/)
  const command = cmd?.toLowerCase() || ''

  if (command.startsWith('./')) {
    const appName = command.slice(2).toLowerCase()
    const app = desktopApps.find(a => a.id === appName)
    if (appName === 'terminal') {
      return { output: 'Terminal is already running.' }
    }
    if (app) {
      return { output: `Starting ${appName}...`, action: 'open_app', appId: app.id }
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
      return { output: formatLs() }

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
        return { output: BSOD, action: 'bsod' }
      }
      return { output: `sudo: ${args.join(' ')}: command not found` }

    case 'ping':
      return { output: fakePing(domain) }

    case 'nmap':
      return { output: NMAP_OUTPUT }

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
