export const TARJETA = 'TARJETA_CREDITO'

// Opciones del selector de tipo, en el orden del diseño.
export const TIPOS_CUENTA = [
  { valor: 'AHORRO', etiqueta: 'Ahorros' },
  { valor: 'CORRIENTE', etiqueta: 'Corriente' },
  { valor: TARJETA, etiqueta: 'Tarjeta de crédito' },
  { valor: 'EFECTIVO', etiqueta: 'Efectivo' },
]

// Texto corto para la etiqueta de cada tarjeta de cuenta.
const ETIQUETA_CORTA = { AHORRO: 'Ahorros', CORRIENTE: 'Corriente', TARJETA_CREDITO: 'Tarjeta', EFECTIVO: 'Efectivo' }
export const etiquetaTipo = (tipo) => ETIQUETA_CORTA[tipo] ?? tipo

// Tonos para repartir el saldo entre subcuentas (se repiten si hay muchas) y para lo no asignado.
const TONOS_SUBCUENTA = ['#171717', '#5a5a5f', '#9c9c97']
export const COLOR_SIN_ASIGNAR = '#e5e5e7'
export const colorSubcuenta = (indice) => TONOS_SUBCUENTA[indice % TONOS_SUBCUENTA.length]
