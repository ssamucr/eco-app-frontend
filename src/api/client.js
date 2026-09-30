const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// FastAPI responde { detail: "mensaje" } en los errores propios y { detail: [...] } en los de validación.
async function mensajeDeError(respuesta) {
  try {
    const { detail } = await respuesta.json()
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) return 'Los datos enviados no son válidos.'
  } catch {
    // el cuerpo no era JSON
  }
  return `La API respondió con error ${respuesta.status}`
}

export async function apiRequest(metodo, ruta, { cuerpo, signal } = {}) {
  let respuesta
  try {
    respuesta = await fetch(`${BASE_URL}${ruta}`, {
      method: metodo,
      signal,
      headers: cuerpo === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError(`No se pudo conectar con la API en ${BASE_URL}`)
  }
  if (!respuesta.ok) {
    throw new ApiError(await mensajeDeError(respuesta), respuesta.status)
  }
  return respuesta.json()
}

export const apiGet = (ruta, opciones) => apiRequest('GET', ruta, opciones)
export const apiPost = (ruta, cuerpo, opciones) => apiRequest('POST', ruta, { cuerpo, ...opciones })
export const apiPut = (ruta, cuerpo) => apiRequest('PUT', ruta, { cuerpo })
export const apiDelete = (ruta) => apiRequest('DELETE', ruta)
