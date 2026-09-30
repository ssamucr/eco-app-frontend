// Opciones del selector de tipo, en el orden del diseño.
export const TIPOS_TRANSACCION = [
  { valor: 'TRANSFERENCIA', etiqueta: 'Transferencia' },
  { valor: 'PAGO_TARJETA', etiqueta: 'Pago a tarjeta' },
  { valor: 'GASTO', etiqueta: 'Gasto' },
  { valor: 'INGRESO', etiqueta: 'Ingreso' },
]

export const TIPOS_SUBCUENTA = [
  { valor: 'ASIGNACION', etiqueta: 'Asignación' },
  { valor: 'GASTO', etiqueta: 'Gasto' },
  { valor: 'TRANSFERENCIA', etiqueta: 'Transferencia' },
  { valor: 'REPOSICION', etiqueta: 'Reposición' },
]

const etiquetaDe = (lista, valor) => lista.find((t) => t.valor === valor)?.etiqueta ?? valor
export const etiquetaTransaccion = (tipo) => etiquetaDe(TIPOS_TRANSACCION, tipo)
export const etiquetaSubcuenta = (tipo) => etiquetaDe(TIPOS_SUBCUENTA, tipo)

// Ícono y color de cada tipo de transacción en las listas.
export function estiloPorTipo(tipo) {
  switch (tipo) {
    case 'GASTO':
      return { icono: 'menos', clase: 'expense' }
    case 'INGRESO':
      return { icono: 'mas', clase: 'income' }
    case 'PAGO_TARJETA':
      return { icono: 'tarjeta', clase: '' }
    default:
      return { icono: 'transferencia', clase: '' }
  }
}

// Reglas de cada tipo de movimiento de subcuenta: de dónde sale y a dónde llega el saldo.
export const subcuentaTieneOrigen = (tipo) => tipo === 'GASTO' || tipo === 'TRANSFERENCIA'
export const subcuentaTieneDestino = (tipo) => tipo !== 'GASTO'

// Las subcuentas de una cuenta y lo que hay libre para asignar, listos para los selectores.
export const cuentasConSubcuentas = (opciones) => opciones.cuentas.filter((c) => c.subcuentas.length > 0)
