import { useCallback, useState } from 'react'
import { executeCommand, getCompletions, type CommandResult, type TerminalConfig } from './commands'
import { SIGTERM_SKULL, SIGTERM_SKULL_MOBILE } from './ascii'

export type TerminalLine = {
  id: number
  type: 'input' | 'output'
  content: string
}

export type TabCompleteResult = {
  completed: string
  suggestions: string[]
}

function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

function buildInitialLines(bootMessage: string): TerminalLine[] {
  const lines: TerminalLine[] = []
  let id = 0
  const skull = isMobile() ? SIGTERM_SKULL_MOBILE : SIGTERM_SKULL
  for (const line of skull.split('\n')) {
    lines.push({ id: id++, type: 'output', content: line })
  }
  lines.push({ id: id++, type: 'output', content: bootMessage })
  return lines
}

export function useTerminal(config?: TerminalConfig) {
  const siteName = config?.siteIdentity?.siteName ?? 'TEMPL3'
  const bootMessage = `${siteName} OS — Type "help" for commands.`

  const [lines, setLines] = useState<TerminalLine[]>(() => buildInitialLines(bootMessage))
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [input, setInput] = useState('')

  const prompt = config?.siteIdentity?.terminalPrompt ?? 'sigterm@templ3:~$'

  const addLine = useCallback(
    (type: 'input' | 'output', content: string) => {
      setLines((prev: TerminalLine[]) => [...prev, { id: prev.length, type, content }])
    },
    []
  )

  const submit = useCallback(
    (value: string): CommandResult => {
      addLine('input', `${prompt} ${value}`)

      // Merge isMobile into config for command execution
      const fullConfig = { ...config, isMobile: isMobile() }
      const result = executeCommand(value, fullConfig)

      if (result.action === 'clear') {
        setLines([])
      } else if (result.output) {
        result.output.split('\n').forEach((line) => {
          addLine('output', line)
        })
      }

      if (value.trim()) {
        setHistory((prev: string[]) => [...prev, value])
      }
      setHistoryIndex(-1)
      setInput('')

      return result
    },
    [addLine, config, prompt]
  )

  const navigateHistory = useCallback(
    (direction: 'up' | 'down') => {
      if (history.length === 0) return

      if (direction === 'up') {
        const newIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setInput(history[newIndex] || '')
      } else {
        if (historyIndex === -1) return
        const newIndex = historyIndex + 1
        if (newIndex >= history.length) {
          setHistoryIndex(-1)
          setInput('')
        } else {
          setHistoryIndex(newIndex)
          setInput(history[newIndex] || '')
        }
      }
    },
    [history, historyIndex]
  )

  const tabComplete = useCallback(
    (currentInput: string): TabCompleteResult => {
      const suggestions = getCompletions(currentInput, config)

      if (suggestions.length === 0) {
        return { completed: currentInput, suggestions: [] }
      }

      if (suggestions.length === 1) {
        // Single match - complete it fully
        const parts = currentInput.trim().split(/\s+/)
        if (parts.length <= 1) {
          // Completing a command or ./app
          return { completed: suggestions[0] + ' ', suggestions: [] }
        } else {
          // Completing an argument
          parts[parts.length - 1] = suggestions[0]
          return { completed: parts.join(' ') + ' ', suggestions: [] }
        }
      }

      // Multiple matches - find common prefix and show suggestions
      const commonPrefix = suggestions.reduce((prefix, suggestion) => {
        while (!suggestion.startsWith(prefix)) {
          prefix = prefix.slice(0, -1)
        }
        return prefix
      }, suggestions[0])

      const parts = currentInput.trim().split(/\s+/)
      if (parts.length <= 1) {
        return { completed: commonPrefix, suggestions }
      } else {
        parts[parts.length - 1] = commonPrefix
        return { completed: parts.join(' '), suggestions }
      }
    },
    [config]
  )

  return {
    lines,
    input,
    setInput,
    submit,
    navigateHistory,
    tabComplete,
    prompt,
    addLine,
  }
}
