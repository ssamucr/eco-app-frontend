import { getResumen } from '../api/resumen'
import { useRecurso } from './useRecurso'

export function useResumen(idCiclo) {
  const { data, error, loading, recargar } = useRecurso((o) => getResumen(idCiclo, o), [idCiclo])
  return { data, error, loading: loading && !data, reintentar: recargar }
}

