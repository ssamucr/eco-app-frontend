import { apiDelete, apiGet, apiPost, apiPut } from './client'

export const TAMANO_PAGINA = 50

// `rango` = { desde, hasta } (fechas ISO, inclusive) para ver solo un período, por ejemplo un ciclo.
const pagina = (numero, rango) =>
  `limite=${TAMANO_PAGINA}&pagina=${numero}${rango ? `&desde=${rango.desde}&hasta=${rango.hasta}` : ''}`

export const getMovimientos = (numero, opciones, rango) =>
  apiGet(`/movimientos-detalle?${pagina(numero, rango)}`, opciones)
export const getMovimiento = (id, opciones) => apiGet(`/movimientos-detalle/${id}`, opciones)
export const getMovimientosSubcuenta = (numero, opciones, rango) =>
  apiGet(`/movimientos-subcuenta-detalle?${pagina(numero, rango)}`, opciones)
export const getOpcionesMovimiento = (opciones) => apiGet('/movimientos-opciones', opciones)

export const crearTransaccion = (datos) => apiPost('/transacciones', datos)
export const actualizarTransaccion = (id, datos) => apiPut(`/transacciones/${id}`, datos)
export const eliminarTransaccion = (id) => apiDelete(`/transacciones/${id}`)

export const crearMovimientoSubcuenta = (datos) => apiPost('/movimientos-subcuenta', datos)
export const eliminarMovimientoSubcuenta = (id) => apiDelete(`/movimientos-subcuenta/${id}`)
