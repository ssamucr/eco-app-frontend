// Autorizacion de aplicaciones externas (por ejemplo el conector de Claude) con el servidor OAuth de Supabase Auth.
// Supabase envia al usuario a /oauth/consent?authorization_id=...; aqui se consulta quien pide acceso y se aprueba o
// se niega. Es la API REST de Supabase (la misma que usa su libreria), con el token de la sesion del usuario.
import { tokenVigente } from './sesion'

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '')
const CLAVE_PUBLICA = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? ''

async function pedir(metodo, idAutorizacion, sufijo = '', cuerpo) {
  const token = await tokenVigente()
  if (!token) throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.')
  let respuesta
  try {
    respuesta = await fetch(`${SUPABASE_URL}/auth/v1/oauth/authorizations/${encodeURIComponent(idAutorizacion)}${sufijo}`, {
      method: metodo,
      headers: { apikey: CLAVE_PUBLICA, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: cuerpo ? JSON.stringify(cuerpo) : undefined,
    })
  } catch {
    throw new Error('No se pudo conectar con el servicio de acceso. Revisa tu conexión.')
  }
  const datos = await respuesta.json().catch(() => ({}))
  if (!respuesta.ok) {
    throw new Error(datos.msg || datos.message || datos.error_description || 'La solicitud de acceso no es válida o ya venció.')
  }
  return datos
}

// Devuelve los datos de la solicitud ({ client, redirect_uri, scope, ... }) o, si ya se autorizo antes, { redirect_url }.
export const detallesAutorizacion = (idAutorizacion) => pedir('GET', idAutorizacion)

// accion: 'approve' | 'deny'. Devuelve { redirect_url }: a donde hay que volver para que la aplicacion siga.
export const decidirAutorizacion = (idAutorizacion, accion) => pedir('POST', idAutorizacion, '/consent', { action: accion })
