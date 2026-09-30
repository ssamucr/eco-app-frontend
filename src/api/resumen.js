import { apiGet } from './client'

export function getResumen(options) {
  return apiGet('/resumen', options)
}
