import { getResumen } from '../api/resumen'
import { useRecurso } from './useRecurso'

export function useResumen() {
  const { data, error, loading, recargar } = useRecurso(getResumen)
  return { data, error, loading: loading && !data, reintentar: recargar }
}
