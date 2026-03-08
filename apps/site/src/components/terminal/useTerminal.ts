import { useCallback, useState } from 'react'
import { executeCommand, type CommandResult } from './commands'
import { SIGTERM_SKULL } from './ascii'

export type TerminalLine = {
  id: number
  type: 'input' | 'output'
  content: string
}

function buildInitialLines(): TerminalLine[] {
  const lines: TerminalLine[] = []
  let id = 0
  for (const line of SIGTERM_SKULL.split('\n')) {
    lines.push({ id: id++, type: 'output', content: line })
  }
  lines.push({ id: id++, type: 'output', content: 'TEMPL3 OS v0.6.6.6 — Type "help" for commands.' })
  return lines
}

export function useTerminal() {
  const [lines, setLines] = useState<TerminalLine[]>(buildInitialLines)
  const [history, setHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [input, setInput] = useState('')

  const addLine = useCallback(
    (type: 'input' | 'output', content: string) => {
      setLines((prev: TerminalLine[]) => [...prev, { id: prev.length, type, content }])
    },
    []
  )

  const submit = useCallback(
    (value: string): CommandResult => {
      addLine('input', `sigterm@templ3:~$ ${value}`)

      const result = executeCommand(value)

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
    [addLine]
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
  }
}
