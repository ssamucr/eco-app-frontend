import { useCallback, useEffect, useState } from 'react'

// Carga un recurso al montar y cada vez que cambian `claves`. Mientras recarga conserva los datos anteriores.
export function useRecurso(cargar, claves = []) {
  const [estado, setEstado] = useState({ data: null, error: null, loading: true })
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    const controlador = new AbortController()
    setEstado((previo) => ({ ...previo, error: null, loading: true }))
    cargar({ signal: controlador.signal })
      .then((data) => setEstado({ data, error: null, loading: false }))
      .catch((error) => {
        if (error.name === 'AbortError') return
        setEstado({ data: null, error, loading: false })
      })
    return () => controlador.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intento, ...claves])

  const recargar = useCallback(() => setIntento((n) => n + 1), [])
  return { ...estado, recargar }
}
