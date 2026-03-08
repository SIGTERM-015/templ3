import { desktopApps, operator } from '../../data/siteConfig'
import { BSOD, HELP_TABLE, NEOFETCH, NMAP_OUTPUT } from './ascii'

export type CommandResult = {
  output: string
  action?: 'clear' | 'exit' | 'navigate' | 'glitch' | 'bsod' | 'open_app' | 'open_url'
  navigateTo?: string
  appId?: string
  openUrl?: string
}

const HOME_FILES = [
  ...desktopApps.map(a => a.id),
  'terminal',
  'sigterm.txt',
]

const WHOAMI = `Handle:    Sigterm / Sigterm015
Role:      DevSecOps → Red Team
Status:    ACTIVE
Specialty: Pentesting, Bug Bounty, Automation
Domain:    sigterm.vodka
Codename:  Templ3`

const CAT_SIGTERM = operator.bio.join('\n\n')

const RICKROLL_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ'

function fakePing(): string {
  const lines = []
  lines.push('PING sigterm.vodka (104.21.xx.xx) 56(84) bytes of data.')
  for (let i = 0; i < 4; i++) {
    const ms = (Math.random() * 15 + 5).toFixed(1)
    lines.push(`64 bytes from sigterm.vodka: icmp_seq=${i + 1} ttl=57 time=${ms} ms`)
  }
  lines.push('')
  lines.push('--- sigterm.vodka ping statistics ---')
  lines.push('4 packets transmitted, 4 received, 0% packet loss')
  return lines.join('\n')
}

function formatLs(): string {
  const cols: string[] = []
  for (const f of HOME_FILES) {
    if (f === 'sigterm.txt') {
      cols.push(f)
    } else {
      cols.push(f)
    }
  }
  let out = ''
  const colWidth = 14
  for (let i = 0; i < cols.length; i++) {
    out += cols[i].padEnd(colWidth)
    if ((i + 1) % 4 === 0 && i < cols.length - 1) out += '\n'
  }
  return out
}

export function executeCommand(input: string): CommandResult {
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
      return { output: WHOAMI }

    case 'neofetch':
      return { output: NEOFETCH }

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
        return { output: CAT_SIGTERM }
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
      return { output: fakePing() }

    case 'nmap':
      return { output: NMAP_OUTPUT }

    case 'clear':
      return { output: '', action: 'clear' }

    case 'exit':
      return { output: 'Closing terminal...', action: 'exit' }

    case 'echo':
      return { output: args.join(' ') }

    case 'pwd':
      return { output: '/home/sigterm' }

    case 'date':
      return { output: new Date().toUTCString() }

    case 'uname':
      return { output: 'Templ3 OS 0.6.6.6 sigterm-sanctum x86_64 GNU/Linux' }

    default:
      return { output: `${command}: command not found. Type 'help' for available commands.` }
  }
}
