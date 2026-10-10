import { apiGet } from './client'

// Sin `idCiclo` devuelve el ciclo actual de la configuración principal.
export function getResumen(idCiclo, options) {
  return apiGet(idCiclo ? `/resumen?id_ciclo=${idCiclo}` : '/resumen', options)
}
