import { apiDelete, apiGet, apiPost, apiPut } from './client'

export const getPersonasDetalle = (opciones) => apiGet('/personas-detalle', opciones)
export const getPersonaDetalle = (id, opciones) => apiGet(`/personas-detalle/${id}`, opciones)

export const crearPersona = (persona) => apiPost('/personas', persona)
export const actualizarPersona = (id, persona) => apiPut(`/personas/${id}`, persona)
export const eliminarPersona = (id) => apiDelete(`/personas/${id}`)
