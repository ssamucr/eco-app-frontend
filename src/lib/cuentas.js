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

// Colores de las subcuentas. Los primeros son fijos y bien distintos entre sí; si una cuenta tiene más,
// el resto se reparte por todo el círculo cromático. El índice lo entrega la API según el orden de creación,
// así cada subcuenta conserva su color en todas las pantallas.
const TONOS_SUBCUENTA = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#8b5cf6',
  '#ef4444',
  '#06b6d4',
  '#f97316',
  '#ec4899',
  '#84cc16',
  '#a16207',
]
export const COLOR_SIN_ASIGNAR = '#e5e5e7'
export function colorSubcuenta(indice = 0) {
  if (indice < TONOS_SUBCUENTA.length) return TONOS_SUBCUENTA[indice]
  const extra = indice - TONOS_SUBCUENTA.length
  return `hsl(${Math.round((extra * 137.508 + 20) % 360)} ${extra % 2 ? 72 : 58}% ${extra % 3 === 0 ? 42 : 55}%)`
}

// Ícono de cada tipo de cuenta.
const ICONO_TIPO = { AHORRO: 'ahorro', CORRIENTE: 'cuentas', EFECTIVO: 'efectivo', TARJETA_CREDITO: 'tarjeta' }
export const iconoTipo = (tipo) => ICONO_TIPO[tipo] ?? 'cartera'
