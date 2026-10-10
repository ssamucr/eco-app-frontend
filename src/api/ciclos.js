import { apiDelete, apiGet, apiPost, apiPut } from './client'

export const getConfigsCiclos = (opciones) => apiGet('/ciclos-config', opciones)
export const crearConfigCiclos = (datos) => apiPost('/ciclos-config', datos)
export const actualizarConfigCiclos = (id, datos) => apiPut(`/ciclos-config/${id}`, datos)
export const eliminarConfigCiclos = (id) => apiDelete(`/ciclos-config/${id}`)

export const getCiclos = (idConfig, limite, opciones) =>
  apiGet(`/ciclos?${idConfig != null ? `id_ciclo_config=${idConfig}&` : ''}limite=${limite}`, opciones)
export const getCicloActual = (idConfig, opciones) =>
  apiGet(`/ciclos/actual${idConfig != null ? `?id_ciclo_config=${idConfig}` : ''}`, opciones)
export const ajustarCiclo = (id, fechaInicio) => apiPut(`/ciclos/${id}`, { fecha_inicio: fechaInicio })
