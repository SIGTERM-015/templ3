export type ThemePresetId = 'default' | 'tokyo-night' | 'dracula'

export type CustomThemeColors = {
  bg: string
  panel: string
  text: string
  amber: string
  magenta: string
  terminal: string
}

export const DEFAULT_CUSTOM_THEME: CustomThemeColors = {
  bg: '#0f1012',
  panel: '#1a1d21',
  text: '#f0ead7',
  amber: '#d49b3c',
  magenta: '#b94bbf',
  terminal: '#6dcf8d',
}

export const CUSTOM_THEME_KEYS: (keyof CustomThemeColors)[] = ['bg', 'panel', 'text', 'amber', 'magenta', 'terminal']

export type ThemePreset = {
  id: ThemePresetId
  label: string
  description: string
  variables: Record<string, string>
  displayColors: CustomThemeColors
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'default',
    label: 'Default',
    description: 'Original Templ3 palette',
    variables: {},
    displayColors: {
      bg: '#0f1012',
      panel: '#1a1d21',
      text: '#e8e4dc',
      amber: '#d4a84a',
      magenta: '#b94bbf',
      terminal: '#6dcf8d',
    },
  },
  {
    id: 'tokyo-night',
    label: 'Tokyo Night',
    description: 'Deep blue base with neon accents',
    displayColors: {
      bg: '#1a1b26',
      panel: '#24283b',
      text: '#c0caf5',
      amber: '#7aa2f7',
      magenta: '#bb9af7',
      terminal: '#9ece6a',
    },
    variables: {
      '--bg': '#1a1b26',
      '--bg-elevated': '#24283b',
      '--bg-deep': '#16161e',
      '--bg-html': '#1f2335',
      '--panel': '#24283b',
      '--panel-border': '#414868',
      '--text': '#c0caf5',
      '--muted': '#9aa5ce',
      '--faded': '#7f8cb2',
      '--amber': '#7aa2f7',
      '--amber-glow': '#89b4fa',
      '--magenta': '#bb9af7',
      '--magenta-bright': '#c6a0ff',
      '--terminal': '#9ece6a',
      '--terminal-bg': '#16161e',
      '--terminal-border': '#2f334d',
      '--bezel-brand': '#7f8cb2',
      '--metal': '#2a2f45',
    },
  },
  {
    id: 'dracula',
    label: 'Dracula',
    description: 'Purple dark theme with vivid contrasts',
    displayColors: {
      bg: '#282a36',
      panel: '#303445',
      text: '#f8f8f2',
      amber: '#8be9fd',
      magenta: '#ff79c6',
      terminal: '#50fa7b',
    },
    variables: {
      '--bg': '#282a36',
      '--bg-elevated': '#303445',
      '--bg-deep': '#21222c',
      '--bg-html': '#1d1e28',
      '--panel': '#303445',
      '--panel-border': '#44475a',
      '--text': '#f8f8f2',
      '--muted': '#bdc0d3',
      '--faded': '#9094aa',
      '--amber': '#8be9fd',
      '--amber-glow': '#a7f2ff',
      '--magenta': '#ff79c6',
      '--magenta-bright': '#ff92d0',
      '--terminal': '#50fa7b',
      '--terminal-bg': '#1f202b',
      '--terminal-border': '#44475a',
      '--bezel-brand': '#9094aa',
      '--metal': '#343746',
    },
  },
]

export const PRESET_THEME_IDS = THEME_PRESETS.map((preset) => preset.id)

export function buildCustomThemeVariables(colors: CustomThemeColors): Record<string, string> {
  return {
    '--bg': colors.bg,
    '--bg-elevated': `color-mix(in oklab, ${colors.bg} 86%, white 14%)`,
    '--bg-deep': `color-mix(in oklab, ${colors.bg} 90%, black 10%)`,
    '--bg-html': `color-mix(in oklab, ${colors.bg} 78%, black 22%)`,
    '--bg-code': `color-mix(in oklab, ${colors.bg} 88%, black 12% / 0.8)`,
    '--bg-glass': `color-mix(in oklab, ${colors.bg} 85%, black 15% / 0.8)`,
    '--panel': colors.panel,
    '--panel-border': `color-mix(in oklab, ${colors.panel} 65%, ${colors.text} 35%)`,
    '--text': colors.text,
    '--muted': `color-mix(in oklab, ${colors.text} 72%, ${colors.bg} 28%)`,
    '--faded': `color-mix(in oklab, ${colors.text} 45%, ${colors.bg} 55%)`,
    '--amber': colors.amber,
    '--amber-glow': `color-mix(in oklab, ${colors.amber} 78%, white 22%)`,
    '--amber-a3': `color-mix(in oklab, ${colors.amber} 3%, transparent)`,
    '--amber-a4': `color-mix(in oklab, ${colors.amber} 4%, transparent)`,
    '--amber-a6': `color-mix(in oklab, ${colors.amber} 6%, transparent)`,
    '--amber-a8': `color-mix(in oklab, ${colors.amber} 8%, transparent)`,
    '--amber-a10': `color-mix(in oklab, ${colors.amber} 10%, transparent)`,
    '--amber-a15': `color-mix(in oklab, ${colors.amber} 15%, transparent)`,
    '--amber-a20': `color-mix(in oklab, ${colors.amber} 20%, transparent)`,
    '--amber-a30': `color-mix(in oklab, ${colors.amber} 30%, transparent)`,
    '--amber-a80': `color-mix(in oklab, ${colors.amber} 80%, transparent)`,
    '--magenta': colors.magenta,
    '--magenta-bright': `color-mix(in oklab, ${colors.magenta} 80%, white 20%)`,
    '--magenta-a40': `color-mix(in oklab, ${colors.magenta} 40%, transparent)`,
    '--terminal': colors.terminal,
    '--terminal-dim': `color-mix(in oklab, ${colors.terminal} 65%, ${colors.bg} 35%)`,
    '--terminal-faded': `color-mix(in oklab, ${colors.terminal} 35%, ${colors.bg} 65%)`,
    '--terminal-bg': `color-mix(in oklab, ${colors.bg} 90%, black 10%)`,
    '--terminal-border': `color-mix(in oklab, ${colors.terminal} 25%, ${colors.bg} 75%)`,
  }
}

export const THEME_OVERRIDE_KEYS = Array.from(
  new Set([
    ...THEME_PRESETS.flatMap((preset) => Object.keys(preset.variables)),
    ...Object.keys(buildCustomThemeVariables(DEFAULT_CUSTOM_THEME)),
  ])
)
