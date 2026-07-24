import { useState, useEffect, useRef } from 'react'

export function useCmsResource<T>(seed: T, url: string | null): {
  data: T
  loading: boolean
  error: string | null
} {
  const [data, setData] = useState<T>(seed)
  const [loading, setLoading] = useState(!!url)
  const [error, setError] = useState<string | null>(null)
  const seedRef = useRef(seed)

  useEffect(() => {
    if (!url) {
      setData(seedRef.current)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    setLoading(true)
    setError(null)

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<T>
      })
      .then((result) => {
        if (!controller.signal.aborted) {
          setData(result)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Fetch failed')
          setLoading(false)
        }
      })

    return () => controller.abort()
  }, [url])

  return { data, loading, error }
}
