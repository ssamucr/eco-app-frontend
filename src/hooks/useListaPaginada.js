import { useCallback, useEffect, useRef, useState } from 'react'

// Lista que carga por páginas. `cargarPagina(numero, { signal })` devuelve { items, total }.
// Se reinicia al cambiar `claves` o al llamar a `reiniciar`.
export function useListaPaginada(cargarPagina, claves = []) {
  const [estado, setEstado] = useState({ items: [], total: 0, pagina: 0, cargando: true, cargandoMas: false, error: null })
  const [version, setVersion] = useState(0)
  const controlador = useRef(null)
  const cargador = useRef(cargarPagina)
  cargador.current = cargarPagina

  const pedir = useCallback((numero, acumular) => {
    controlador.current?.abort()
    const actual = new AbortController()
    controlador.current = actual
    setEstado((previo) => ({ ...previo, error: null, cargando: !acumular, cargandoMas: acumular }))
    cargador
      .current(numero, { signal: actual.signal })
      .then(({ items, total }) =>
        setEstado((previo) => ({
          items: acumular ? [...previo.items, ...items] : items,
          total,
          pagina: numero,
          cargando: false,
          cargandoMas: false,
          error: null,
        })),
      )
      .catch((error) => {
        if (error.name === 'AbortError') return
        setEstado((previo) => ({ ...previo, cargando: false, cargandoMas: false, error }))
      })
  }, [])

  useEffect(() => {
    pedir(0, false)
    return () => controlador.current?.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, ...claves])

  const cargarMas = useCallback(() => pedir(estado.pagina + 1, true), [pedir, estado.pagina])
  const reiniciar = useCallback(() => setVersion((n) => n + 1), [])
  return { ...estado, hayMas: estado.items.length < estado.total, cargarMas, reiniciar }
}
