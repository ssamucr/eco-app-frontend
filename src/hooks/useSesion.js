import { useSyncExternalStore } from 'react'
import { obtenerSesion, suscribir } from '../lib/sesion'

// La sesion actual (o null). Se actualiza sola al iniciar o cerrar sesion, tambien desde otra pestaña.
export function useSesion() {
  return useSyncExternalStore(suscribir, obtenerSesion)
}
