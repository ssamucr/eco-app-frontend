import { apiDelete, apiGet, apiPost, apiPut } from './client'

export const getCuentasDetalle = (opciones) => apiGet('/cuentas-detalle', opciones)
export const getCuentaDetalle = (id, opciones) => apiGet(`/cuentas-detalle/${id}`, opciones)

export const crearCuenta = (cuenta) => apiPost('/cuentas', cuenta)
export const actualizarCuenta = (id, cuenta) => apiPut(`/cuentas/${id}`, cuenta)
export const eliminarCuenta = (id) => apiDelete(`/cuentas/${id}`)
export const eliminarCuentaConMovimientos = (id) => apiDelete(`/cuentas/${id}?en_cascada=true`)

export const crearSubcuenta = (subcuenta) => apiPost('/subcuentas', subcuenta)
export const actualizarSubcuenta = (id, subcuenta) => apiPut(`/subcuentas/${id}`, subcuenta)
export const eliminarSubcuenta = (id) => apiDelete(`/subcuentas/${id}`)
