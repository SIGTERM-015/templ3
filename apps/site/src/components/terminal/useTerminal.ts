import { useCallback, useState } from 'react'
import { executeCommand, type CommandResult, type TerminalConfig } from './commands'
import { SIGTERM_SKULL } from './ascii'

export type TerminalLine = {
  id: number
  type: 'input' | 'output'
  content: string
}

function buildInitialLines(bootMessage: string): TerminalLine[] {
  const lines: TerminalLine[] = []
  let id = 0
  for (const line of SIGTERM_SKULL.split('\n')) {
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

      const result = executeCommand(value, config)

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

  return {
    lines,
    input,
    setInput,
    submit,
    navigateHistory,
    prompt,
  }
}
