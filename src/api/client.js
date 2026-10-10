import { AUTH_ACTIVA, cerrarSesion, renovar, tokenVigente } from '../lib/sesion'

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

// Pide a la API con el token de la sesion. Si responde 401 intenta renovarlo una vez; si tampoco, cierra la sesion
// (la app vuelve sola a la pantalla de inicio de sesion).
async function pedir(ruta, opciones = {}) {
  const enviar = async () => {
    const encabezados = { ...opciones.headers }
    if (AUTH_ACTIVA) {
      const token = await tokenVigente()
      if (token) encabezados.Authorization = `Bearer ${token}`
    }
    return fetch(`${BASE_URL}${ruta}`, { ...opciones, headers: Object.keys(encabezados).length ? encabezados : undefined })
  }
  let respuesta = await enviar()
  if (respuesta.status === 401 && AUTH_ACTIVA) {
    if (await renovar()) respuesta = await enviar()
    if (respuesta.status === 401) cerrarSesion()
  }
  return respuesta
}

export async function apiRequest(metodo, ruta, { cuerpo, signal } = {}) {
  let respuesta
  try {
    respuesta = await pedir(ruta, {
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

// Descarga un archivo (Excel, PDF...) que genera el servidor.
export async function apiDescargar(ruta, nombre) {
  let respuesta
  try {
    respuesta = await pedir(ruta)
  } catch {
    throw new ApiError(`No se pudo conectar con la API en ${BASE_URL}`)
  }
  if (!respuesta.ok) throw new ApiError(await mensajeDeError(respuesta), respuesta.status)
  const url = URL.createObjectURL(await respuesta.blob())
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombre
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  URL.revokeObjectURL(url)
}

export const apiGet = (ruta, opciones) => apiRequest('GET', ruta, opciones)
export const apiPost = (ruta, cuerpo, opciones) => apiRequest('POST', ruta, { cuerpo, ...opciones })
export const apiPut = (ruta, cuerpo) => apiRequest('PUT', ruta, { cuerpo })
export const apiDelete = (ruta) => apiRequest('DELETE', ruta)
