import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { desktopApps, site } from '../../data/siteConfig'
import { WindowFrame } from './WindowFrame'
import { DesktopIcons } from './DesktopIcons'
import { TaskbarReact } from './TaskbarReact'
import { DossierApp } from './apps/DossierApp'
import { GazetteApp } from './apps/GazetteApp'
import { ArmoryApp } from './apps/ArmoryApp'
import { MediaApp } from './apps/MediaApp'
import { CommsApp } from './apps/CommsApp'
import { ReadmeApp } from './apps/ReadmeApp'
import { TerminalApp } from './apps/TerminalApp'
import { SettingsApp } from './apps/SettingsApp'
import {
  buildCustomThemeVariables,
  DEFAULT_CUSTOM_THEME,
  PRESET_THEME_IDS,
  THEME_OVERRIDE_KEYS,
  THEME_PRESETS,
  type CustomThemeColors,
  type ThemePresetId,
} from './themePresets'

export type AppId = 'dossier' | 'gazette' | 'armory' | 'media' | 'comms' | 'readme' | 'terminal' | 'settings'

export type WindowState = {
  id: string
  appId: AppId
  title: string
  icon: string
  x: number
  y: number
  w: number
  h: number
  zIndex: number
  minimized: boolean
  maximized: boolean
  route?: string
  meta?: Record<string, unknown>
}

type Action =
  | { type: 'SET'; windows: WindowState[] }
  | { type: 'OPEN'; window: WindowState }
  | { type: 'CLOSE'; id: string }
  | { type: 'FOCUS'; id: string; zIndex: number }
  | { type: 'MINIMIZE'; id: string }
  | { type: 'TOGGLE_MAX'; id: string }
  | { type: 'MOVE'; id: string; x: number; y: number }
  | { type: 'RESIZE'; id: string; w: number; h: number }
  | { type: 'UPDATE_ROUTE'; id: string; route: string }

function reducer(state: WindowState[], action: Action): WindowState[] {
  switch (action.type) {
    case 'SET': return action.windows
    case 'OPEN': return [...state, action.window]
    case 'CLOSE': return state.filter(w => w.id !== action.id)
    case 'FOCUS':
      return state.map(w =>
        w.id === action.id ? { ...w, zIndex: action.zIndex, minimized: false } : w
      )
    case 'MINIMIZE':
      return state.map(w =>
        w.id === action.id ? { ...w, minimized: !w.minimized } : w
      )
    case 'TOGGLE_MAX':
      return state.map(w =>
        w.id === action.id ? { ...w, maximized: !w.maximized } : w
      )
    case 'MOVE':
      return state.map(w =>
        w.id === action.id ? { ...w, x: action.x, y: action.y } : w
      )
    case 'RESIZE':
      return state.map(w =>
        w.id === action.id ? { ...w, w: action.w, h: action.h } : w
      )
    case 'UPDATE_ROUTE':
      return state.map(w =>
        w.id === action.id ? { ...w, route: action.route } : w
      )
    default: return state
  }
}

const EXTRA_APPS: Record<string, { title: string; icon: string; w: number; h: number; x: number; y: number }> = {
  terminal: { title: 'terminal', icon: '>_', w: 65, h: 70, x: 18, y: 10 },
}

function createWindow(appId: AppId, zIndex: number, maximized = false, meta?: Record<string, unknown>): WindowState {
  const desktopDef = desktopApps.find(a => a.id === appId)
  const extra = EXTRA_APPS[appId]

  return {
    id: `${appId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    appId,
    title: desktopDef?.windowTitle ?? extra?.title ?? appId.toUpperCase(),
    icon: desktopDef?.glyph ?? extra?.icon ?? '??',
    x: desktopDef?.defaultPos?.x ?? extra?.x ?? 15,
    y: desktopDef?.defaultPos?.y ?? extra?.y ?? 5,
    w: desktopDef?.defaultSize?.w ?? extra?.w ?? 70,
    h: desktopDef?.defaultSize?.h ?? extra?.h ?? 80,
    zIndex,
    minimized: false,
    maximized,
    route: desktopDef?.route,
    meta,
  }
}

const FULL_BLEED_APPS = new Set<string>(['gazette', 'terminal'])

type Props = {
  initialApp?: string
  serverData?: string
  maximized?: boolean
}

type PersonalizationState = {
  themeId: ThemePresetId | 'custom'
  customTheme: CustomThemeColors
  wallpaper: string
}

const PERSONALIZATION_KEY = 'templ3-personalization'

function parseThemeId(value: unknown): ThemePresetId | 'custom' {
  if (value === 'custom') return 'custom'
  if (typeof value === 'string' && PRESET_THEME_IDS.includes(value as ThemePresetId)) {
    return value as ThemePresetId
  }
  return 'default'
}

function getDesktopBackground(wallpaper: string): React.CSSProperties {
  const value = wallpaper.trim() || site.wallpaper || ''
  if (!value) return {}
  if (value.includes('gradient(') || value.startsWith('url(')) {
    return { backgroundImage: value, backgroundSize: 'cover', backgroundPosition: 'center' }
  }
  return { backgroundImage: `url(${value})`, backgroundSize: 'cover', backgroundPosition: 'center' }
}

export function DesktopShell({ initialApp, serverData, maximized: initialMaximized }: Props) {
  const [windows, dispatch] = useReducer(reducer, []) as [WindowState[], (action: Action) => void]
  const [ready, setReady] = useState(false)
  const [themeId, setThemeId] = useState<ThemePresetId | 'custom'>('default')
  const [customTheme, setCustomTheme] = useState<CustomThemeColors>(DEFAULT_CUSTOM_THEME)
  const [wallpaper, setWallpaper] = useState(site.wallpaper ?? '')
  const zRef = useRef(10)

  const nextZ = useCallback(() => ++zRef.current, [])

  useEffect(() => {
    let parsedSD: Record<string, unknown> | undefined
    if (serverData) {
      try { parsedSD = JSON.parse(serverData) } catch {}
    }

    const initial: WindowState[] = []
    let maxZ = 10

    try {
      const saved = sessionStorage.getItem('templ3-windows')
      if (saved) {
        const parsed = JSON.parse(saved) as WindowState[]
        initial.push(...parsed)
        maxZ = Math.max(...parsed.map(w => w.zIndex), maxZ) + 1
      }
    } catch {}

    const shouldMaximize = initialMaximized || (typeof window !== 'undefined' && window.location.search.includes('maximized'))

    if (initialApp) {
      const appId = initialApp as AppId
      const existing = initial.find(w => w.appId === appId)
      if (existing) {
        existing.zIndex = maxZ++
        existing.minimized = false
        if (shouldMaximize) existing.maximized = true
        if (parsedSD) existing.meta = { ...existing.meta, serverData: parsedSD }
      } else {
        const meta = parsedSD ? { serverData: parsedSD } : undefined
        initial.push(createWindow(appId, maxZ++, !!shouldMaximize, meta))
      }
    }

    if (!sessionStorage.getItem('templ3-readme-shown')) {
      if (!initial.find(w => w.appId === 'readme') && !shouldMaximize) {
        initial.push(createWindow('readme', maxZ++))
      }
      sessionStorage.setItem('templ3-readme-shown', '1')
    }

    zRef.current = maxZ
    dispatch({ type: 'SET', windows: initial })
    setReady(true)
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PERSONALIZATION_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as Partial<PersonalizationState>
      setThemeId(parseThemeId(parsed.themeId))
      if (parsed.customTheme && typeof parsed.customTheme === 'object') {
        setCustomTheme({ ...DEFAULT_CUSTOM_THEME, ...parsed.customTheme })
      }
      if (typeof parsed.wallpaper === 'string') {
        setWallpaper(parsed.wallpaper)
      }
    } catch {}
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const preset = THEME_PRESETS.find((entry) => entry.id === themeId)
    const vars = themeId === 'custom'
      ? buildCustomThemeVariables(customTheme)
      : (preset?.variables ?? {})

    for (const key of THEME_OVERRIDE_KEYS) {
      root.style.removeProperty(key)
    }

    for (const [name, value] of Object.entries(vars)) {
      root.style.setProperty(name, value)
    }
  }, [themeId, customTheme])

  useEffect(() => {
    const state: PersonalizationState = { themeId, customTheme, wallpaper }
    localStorage.setItem(PERSONALIZATION_KEY, JSON.stringify(state))
  }, [themeId, customTheme, wallpaper])

  useEffect(() => {
    if (!ready) return
    const serializable = windows.map(({ meta, ...rest }) => rest)
    sessionStorage.setItem('templ3-windows', JSON.stringify(serializable))
  }, [windows, ready])

  useEffect(() => {
    if (!ready) return
    const top = [...windows]
      .filter(w => !w.minimized && w.route)
      .sort((a, b) => b.zIndex - a.zIndex)[0]
    const target = top?.route ?? '/'
    if (window.location.pathname !== target) {
      window.history.pushState(null, '', target)
    }
  }, [windows, ready])

  const openWindow = useCallback((appId: string, opts?: { maximized?: boolean; meta?: Record<string, unknown> }) => {
    const id = appId as AppId
    const existing = windows.find(w => w.appId === id)
    if (existing) {
      dispatch({ type: 'FOCUS', id: existing.id, zIndex: nextZ() })
      return
    }
    dispatch({ type: 'OPEN', window: createWindow(id, nextZ(), opts?.maximized, opts?.meta) })
  }, [windows, nextZ])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '`' && e.ctrlKey) {
        e.preventDefault()
        openWindow('terminal')
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [openWindow])

  const closeWindow = useCallback((id: string) => dispatch({ type: 'CLOSE', id }), [])
  const focusWindow = useCallback((id: string) => dispatch({ type: 'FOCUS', id, zIndex: nextZ() }), [nextZ])
  const minimizeWindow = useCallback((id: string) => dispatch({ type: 'MINIMIZE', id }), [])
  const maximizeWindow = useCallback((id: string) => dispatch({ type: 'TOGGLE_MAX', id }), [])
  const moveWindow = useCallback((id: string, x: number, y: number) => dispatch({ type: 'MOVE', id, x, y }), [])
  const resizeWindow = useCallback((id: string, w: number, h: number) => dispatch({ type: 'RESIZE', id, w, h }), [])
  const updateRoute = useCallback((id: string, route: string) => dispatch({ type: 'UPDATE_ROUTE', id, route }), [])

  const handleNavigate = useCallback((route: string) => {
    const app = desktopApps.find(a => a.route === route)
    if (app) openWindow(app.id)
    else if (route === '/' || route === '') openWindow('dossier')
  }, [openWindow])

  const renderApp = (win: WindowState) => {
    const sd = win.meta?.serverData as Record<string, unknown> | undefined
    switch (win.appId) {
      case 'dossier': return <DossierApp onOpenApp={(id) => openWindow(id)} />
      case 'gazette': return <GazetteApp serverData={sd} onUpdateRoute={(r) => updateRoute(win.id, r)} />
      case 'armory': return <ArmoryApp serverData={sd} />
      case 'media': return <MediaApp serverData={sd} onOpenApp={(id) => openWindow(id)} />
      case 'comms': return <CommsApp serverData={sd} />
      case 'readme': return <ReadmeApp />
      case 'terminal': return <TerminalApp onNavigate={handleNavigate} onOpenApp={(id) => openWindow(id)} />
      case 'settings':
        return (
          <SettingsApp
            themeId={themeId}
            onThemeChange={setThemeId}
            customTheme={customTheme}
            onCustomThemeChange={setCustomTheme}
            wallpaper={wallpaper}
            onWallpaperChange={setWallpaper}
            defaultWallpaper={site.wallpaper ?? ''}
          />
        )
      default: return null
    }
  }

  const focusedId = [...windows]
    .filter(w => !w.minimized)
    .sort((a, b) => b.zIndex - a.zIndex)[0]?.id

  const desktopBg = getDesktopBackground(wallpaper)

  return (
    <div className="desktop" style={desktopBg}>
      <div className="desktop-area">
        <DesktopIcons openApps={windows.map(w => w.appId)} onOpen={openWindow} />
        {windows.filter(w => !w.minimized).map(win => (
          <WindowFrame
            key={win.id}
            title={win.title}
            icon={win.icon}
            x={win.x} y={win.y} w={win.w} h={win.h}
            zIndex={win.zIndex}
            maximized={win.maximized}
            noPadding={FULL_BLEED_APPS.has(win.appId)}
            onFocus={() => focusWindow(win.id)}
            onClose={() => closeWindow(win.id)}
            onMinimize={() => minimizeWindow(win.id)}
            onMaximize={() => maximizeWindow(win.id)}
            onMove={(x, y) => moveWindow(win.id, x, y)}
            onResize={(w, h) => resizeWindow(win.id, w, h)}
          >
            {renderApp(win)}
          </WindowFrame>
        ))}
      </div>
      <TaskbarReact
        windows={windows}
        focusedId={focusedId}
        onFocusWindow={focusWindow}
        onOpenTerminal={() => openWindow('terminal')}
      />
    </div>
  )
}
