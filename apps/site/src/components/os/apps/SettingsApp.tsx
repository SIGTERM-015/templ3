import { useRef } from 'react'
import {
  CUSTOM_THEME_KEYS,
  DEFAULT_CUSTOM_THEME,
  THEME_PRESETS,
  type CustomThemeColors,
  type ThemePresetId,
} from '../themePresets'

type Props = {
  themeId: ThemePresetId | 'custom'
  onThemeChange: (themeId: ThemePresetId | 'custom') => void
  customTheme: CustomThemeColors
  onCustomThemeChange: (next: CustomThemeColors) => void
  wallpaper: string
  onWallpaperChange: (value: string) => void
  defaultWallpaper: string
}

const SWATCH_LABELS: Record<keyof CustomThemeColors, string> = {
  bg: 'Bg',
  panel: 'Panel',
  text: 'Text',
  amber: 'Accent',
  magenta: 'Magenta',
  terminal: 'Terminal',
}

const SWATCH_LETTERS: Record<keyof CustomThemeColors, string> = {
  bg: 'B',
  panel: 'P',
  text: 'S',
  amber: 'A',
  magenta: 'M',
  terminal: 'T',
}

export function SettingsApp({
  themeId,
  onThemeChange,
  customTheme,
  onCustomThemeChange,
  wallpaper,
  onWallpaperChange,
  defaultWallpaper,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isUploadedImage = wallpaper.startsWith('data:')
  const defaultPreviewUrl = defaultWallpaper && !defaultWallpaper.startsWith('gradient') && !defaultWallpaper.startsWith('data:')
    ? defaultWallpaper
    : ''

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      onWallpaperChange(dataUrl)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="settings-app">
      <section className="settings-app__section">
        <h3 className="eyebrow">Theme</h3>
        <p className="settings-app__lead">
          Preset palettes or click Custom squares to pick your own colors.
        </p>
        <div className="settings-app__theme-row">
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="settings-app__theme-card"
              data-active={themeId === preset.id}
              onClick={() => onThemeChange(preset.id)}
              title={preset.description}
            >
              <div className="settings-app__swatches">
                {CUSTOM_THEME_KEYS.map((key) => (
                  <span
                    key={key}
                    className="settings-app__swatch"
                    style={{ background: preset.displayColors[key] }}
                    title={SWATCH_LABELS[key]}
                  >
                    <span className="settings-app__swatch-letter">{SWATCH_LETTERS[key]}</span>
                  </span>
                ))}
              </div>
              <span className="settings-app__theme-name">{preset.label}</span>
            </button>
          ))}
          <button
            type="button"
            className="settings-app__theme-card"
            data-active={themeId === 'custom'}
            onClick={() => onThemeChange('custom')}
            title="Select custom theme"
          >
            <div className="settings-app__swatches">
              {CUSTOM_THEME_KEYS.map((key) => (
                <label
                  key={key}
                  className="settings-app__swatch settings-app__swatch--editable"
                  title={SWATCH_LABELS[key]}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="settings-app__swatch-bg" style={{ background: customTheme[key] }}>
                    <span className="settings-app__swatch-letter">{SWATCH_LETTERS[key]}</span>
                  </span>
                  <input
                    type="color"
                    value={customTheme[key]}
                    onChange={(e) => {
                      onThemeChange('custom')
                      onCustomThemeChange({ ...customTheme, [key]: e.target.value })
                    }}
                    className="settings-app__color-input"
                  />
                </label>
              ))}
            </div>
            <span className="settings-app__theme-name">Custom</span>
          </button>
        </div>
        {themeId === 'custom' && (
          <button
            type="button"
            className="button--ghost settings-app__reset"
            onClick={() => {
              onCustomThemeChange(DEFAULT_CUSTOM_THEME)
            }}
          >
            Reset custom colors
          </button>
        )}
      </section>

      <section className="settings-app__section">
        <h3 className="eyebrow">Wallpaper</h3>
        <p className="settings-app__lead">
          Default or your own image. Uploaded image is stored locally.
        </p>
        <div className="settings-app__wallpaper-row">
          <button
            type="button"
            className="settings-app__wallpaper-preview"
            onClick={() => onWallpaperChange('')}
            title="Use default wallpaper"
          >
            {defaultPreviewUrl ? (
              <img src={defaultPreviewUrl} alt="Default" className="settings-app__wallpaper-img" />
            ) : (
              <span className="settings-app__wallpaper-placeholder">Default</span>
            )}
          </button>
          <button
            type="button"
            className="settings-app__wallpaper-preview"
            onClick={() => fileInputRef.current?.click()}
            title="Upload your own image"
          >
            {isUploadedImage ? (
              <img src={wallpaper} alt="Your wallpaper" className="settings-app__wallpaper-img" />
            ) : (
              <span className="settings-app__wallpaper-placeholder">Upload your own</span>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="settings-app__file-input"
            aria-hidden
          />
        </div>
      </section>
    </div>
  )
}
