import { apiDelete, apiGet, apiPost, apiPut } from './client'

export const getObligacionesDetalle = (opciones) => apiGet('/obligaciones-detalle', opciones)
export const getObligacionDetalle = (id, opciones) => apiGet(`/obligaciones-detalle/${id}`, opciones)
export const getOpcionesObligacion = (opciones) => apiGet('/obligaciones-opciones', opciones)

export const crearObligacion = (obligacion) => apiPost('/obligaciones', obligacion)
export const actualizarObligacion = (id, obligacion) => apiPut(`/obligaciones/${id}`, obligacion)
export const eliminarObligacion = (id) => apiDelete(`/obligaciones/${id}`)

export const crearLiquidacion = (liquidacion) => apiPost('/liquidaciones', liquidacion)
export const liquidarLote = (lote) => apiPost('/liquidaciones/lote', lote)
export const eliminarLiquidacion = (id, eliminarMovimientos = false) =>
  apiDelete(`/liquidaciones/${id}${eliminarMovimientos ? '?eliminar_movimientos=true' : ''}`)
