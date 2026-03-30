import { useState, useEffect, useCallback, useRef } from 'react'
import { ApiError } from '@/lib/api/client'

interface UseApiState<T> {
  data:     T | null
  loading:  boolean
  error:    string | null
  status:   number | null
}

interface UseApiResult<T> extends UseApiState<T> {
  refetch: () => void
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): UseApiResult<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null, loading: true, error: null, status: null,
  })

  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const run = useCallback(() => {
    setState(s => ({ ...s, loading: true, error: null }))
    fetcherRef.current()
      .then(data => setState({ data, loading: false, error: null, status: 200 }))
      .catch((err: unknown) => {
        if (err instanceof ApiError) {
          setState({ data: null, loading: false, error: err.message, status: err.status })
        } else {
          setState({ data: null, loading: false, error: 'Unexpected error', status: null })
        }
      })
  }, [])

  useEffect(() => { run() }, [run, ...deps])

  return { ...state, refetch: run }
}
