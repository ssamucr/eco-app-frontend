import { apiDelete, apiGet, apiPost, apiPut } from './client'

export const getFinanciamientosDetalle = (opciones) => apiGet('/financiamientos-detalle', opciones)
export const getFinanciamientoDetalle = (id, opciones) => apiGet(`/financiamientos-detalle/${id}`, opciones)
export const getOpcionesFinanciamiento = (opciones) => apiGet('/financiamientos-opciones', opciones)
export const getCalendario = (datos, opciones) => apiPost('/financiamientos/calendario', datos, opciones)

export const crearFinanciamiento = (datos) => apiPost('/financiamientos', datos)
export const actualizarFinanciamiento = (id, datos) => apiPut(`/financiamientos/${id}`, datos)
export const eliminarFinanciamiento = (id) => apiDelete(`/financiamientos/${id}`)

export const getCuotaDetalle = (id, opciones) => apiGet(`/cuotas-detalle/${id}`, opciones)
export const crearCuota = (cuota) => apiPost('/cuotas-financiamiento', cuota)
export const actualizarCuota = (id, cuota) => apiPut(`/cuotas-financiamiento/${id}`, cuota)
export const eliminarCuota = (id) => apiDelete(`/cuotas-financiamiento/${id}`)
export const pagarCuota = (id, pago) => apiPost(`/cuotas-financiamiento/${id}/pagar`, pago)
export const deshacerPagoCuota = (id, eliminarPago = false) =>
  apiPost(`/cuotas-financiamiento/${id}/deshacer-pago${eliminarPago ? '?eliminar_pago=true' : ''}`, {})
