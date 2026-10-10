// Sesion de Supabase Auth (correo y contraseña) hablando directo con su API REST: sin librerias.
// La clave "publishable" es publica por diseño; lo que protege tus datos es el token, que la API verifica en cada peticion.
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '')
const CLAVE_PUBLICA = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? ''
const LLAVE = 'eco.sesion'

// En desarrollo local sin estas variables no hay inicio de sesion (la API local corre con ECO_AUTH_DESACTIVADA=1).
export const AUTH_ACTIVA = Boolean(SUPABASE_URL && CLAVE_PUBLICA)

function leer() {
  try {
    const guardada = JSON.parse(localStorage.getItem(LLAVE))
    return guardada?.access_token && guardada?.refresh_token ? guardada : null
  } catch {
    return null
  }
}

let sesion = AUTH_ACTIVA ? leer() : null
const oyentes = new Set()

function guardar(nueva) {
  sesion = nueva
  try {
    if (nueva) localStorage.setItem(LLAVE, JSON.stringify(nueva))
    else localStorage.removeItem(LLAVE)
  } catch {
    // sin almacenamiento disponible: la sesion dura mientras la pestaña siga abierta
  }
  oyentes.forEach((oyente) => oyente())
}

export const suscribir = (oyente) => {
  oyentes.add(oyente)
  return () => oyentes.delete(oyente)
}
export const obtenerSesion = () => sesion

// Si se inicia o cierra sesion en otra pestaña, esta se entera.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (evento) => {
    if (evento.key === LLAVE && AUTH_ACTIVA) {
      sesion = leer()
      oyentes.forEach((oyente) => oyente())
    }
  })
}

function normalizar(datos) {
  return {
    access_token: datos.access_token,
    refresh_token: datos.refresh_token,
    expires_at: datos.expires_at ?? Math.floor(Date.now() / 1000) + (datos.expires_in ?? 3600),
    email: datos.user?.email ?? sesion?.email ?? '',
  }
}

export class ErrorDeSesion extends Error {
  constructor(message, { definitivo = false } = {}) {
    super(message)
    this.name = 'ErrorDeSesion'
    this.definitivo = definitivo // true: el refresh token ya no sirve y hay que volver a entrar
  }
}

async function pedirTokens(tipo, cuerpo) {
  let respuesta
  try {
    respuesta = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=${tipo}`, {
      method: 'POST',
      headers: { apikey: CLAVE_PUBLICA, 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo),
    })
  } catch {
    throw new ErrorDeSesion('No se pudo conectar con el servicio de acceso. Revisa tu conexión.')
  }
  if (respuesta.ok) return normalizar(await respuesta.json())
  if (respuesta.status === 429) throw new ErrorDeSesion('Demasiados intentos. Espera unos minutos e inténtalo de nuevo.')
  if (respuesta.status >= 500) throw new ErrorDeSesion('El servicio de acceso no está disponible ahora. Inténtalo en un momento.')
  throw new ErrorDeSesion(tipo === 'password' ? 'Correo o contraseña incorrectos.' : 'La sesión expiró.', { definitivo: true })
}

export async function iniciarSesion(correo, contrasena) {
  guardar(await pedirTokens('password', { email: correo.trim(), password: contrasena }))
}

let renovando = null

// Cambia el refresh token por un token nuevo. Devuelve true si hay sesion vigente despues de intentarlo.
export function renovar() {
  if (!sesion) return Promise.resolve(false)
  if (!renovando) {
    const usado = sesion.refresh_token
    renovando = pedirTokens('refresh_token', { refresh_token: usado })
      .then((nueva) => {
        // si otra pestaña ya renovo, se respeta lo ultimo guardado
        guardar(nueva)
        return true
      })
      .catch((error) => {
        if (error.definitivo) guardar(null)
        return false
      })
      .finally(() => {
        renovando = null
      })
  }
  return renovando
}

// Token listo para usar: se renueva con anticipacion si esta por vencer.
export async function tokenVigente() {
  if (!sesion) return null
  if (sesion.expires_at - Math.floor(Date.now() / 1000) < 60) await renovar()
  return sesion?.access_token ?? null
}

export function cerrarSesion() {
  const token = sesion?.access_token
  guardar(null)
  if (token) {
    // aviso al servicio (mejor esfuerzo): invalida el refresh token
    fetch(`${SUPABASE_URL}/auth/v1/logout`, { method: 'POST', headers: { apikey: CLAVE_PUBLICA, Authorization: `Bearer ${token}` } }).catch(() => {})
  }
}
