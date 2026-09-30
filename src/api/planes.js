import { apiDelete, apiGet, apiPost, apiPut } from './client'

export const getPlanesDetalle = (opciones) => apiGet('/planes-detalle', opciones)
export const getPlanDetalle = (id, opciones) => apiGet(`/planes-detalle/${id}`, opciones)

export const crearPlan = (plan) => apiPost('/plan-recurrente', plan)
export const actualizarPlan = (id, plan) => apiPut(`/plan-recurrente/${id}`, plan)
export const eliminarPlan = (id) => apiDelete(`/plan-recurrente/${id}`)

// Con { simular: true } calcula y valida todo, pero no guarda nada.
export const ejecutarPlan = (id, datos) => apiPost(`/plan-recurrente/${id}/ejecutar`, datos)
