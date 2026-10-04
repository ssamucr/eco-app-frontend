import { dinero } from './format'

// "Netflix (Cuenta principal)" si el destino es una subcuenta; si no, solo la cuenta.
export const textoDestino = (destino) =>
  destino.subcuenta ? `${destino.subcuenta} (${destino.cuenta})` : destino.cuenta

// "15% del monto disponible" · "$50.00 fijos"
export const textoMontoDestino = (destino) =>
  destino.porcentaje != null ? `${destino.porcentaje}% del monto disponible` : `${dinero(destino.monto)} fijos`

// El texto de cuántos destinos están activos, para la insignia de la lista.
export function insigniaPlan(plan) {
  if (!plan.activo) return { texto: 'Plan inactivo', activa: false }
  if (plan.destinos_activos === 0) return { texto: 'Sin destinos activos', activa: false }
  return {
    texto: `${plan.destinos_activos} ${plan.destinos_activos === 1 ? 'destino activo' : 'destinos activos'}`,
    activa: true,
  }
}
