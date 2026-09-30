import { dinero, parseMonto } from '../../lib/format'
import { cuentasConSubcuentas, subcuentaTieneDestino, subcuentaTieneOrigen } from '../../lib/movimientos'

export const buscarCuenta = (opciones, id) => opciones.cuentas.find((c) => String(c.id_cuenta) === String(id))
const buscarSubcuenta = (cuenta, id) => cuenta?.subcuentas.find((s) => String(s.id_subcuenta) === String(id))

export function submovimientoInicial(opciones) {
  const primera = cuentasConSubcuentas(opciones)[0]
  return {
    tipo: 'ASIGNACION',
    cuenta: primera ? String(primera.id_cuenta) : '',
    origen: '',
    destino: '',
    categoria: '',
    monto: '',
    descripcion: '',
  }
}

// Lo que hay disponible en el origen del movimiento: el saldo sin asignar o el de la subcuenta de origen.
export function disponibleDeOrigen(valor, cuenta) {
  if (!cuenta) return null
  if (!subcuentaTieneOrigen(valor.tipo)) return cuenta.sin_asignar
  return buscarSubcuenta(cuenta, valor.origen)?.saldo ?? null
}

export function validarSubmovimiento(valor, opciones) {
  const errores = {}
  const cuenta = buscarCuenta(opciones, valor.cuenta)
  if (!cuenta) errores.cuenta = 'Elige una cuenta.'
  if (subcuentaTieneOrigen(valor.tipo) && !valor.origen) errores.origen = 'Elige la subcuenta de origen.'
  if (subcuentaTieneDestino(valor.tipo) && !valor.destino) errores.destino = 'Elige la subcuenta de destino.'
  if (valor.tipo === 'TRANSFERENCIA' && valor.origen && valor.origen === valor.destino) {
    errores.destino = 'Debe ser distinta a la de origen.'
  }
  const monto = parseMonto(valor.monto)
  if (monto == null || Number.isNaN(monto) || monto <= 0) {
    errores.monto = 'Ingresa un monto mayor que 0.'
  } else {
    const disponible = disponibleDeOrigen(valor, cuenta)
    if (disponible != null && monto > disponible + 0.001) {
      errores.monto = `Solo hay ${dinero(Math.max(disponible, 0))} disponibles.`
    }
  }
  return errores
}

export function payloadSubmovimiento(valor) {
  return {
    tipo: valor.tipo,
    monto: parseMonto(valor.monto),
    id_subcuenta_origen: subcuentaTieneOrigen(valor.tipo) ? Number(valor.origen) : null,
    id_subcuenta_destino: subcuentaTieneDestino(valor.tipo) ? Number(valor.destino) : null,
    id_categoria: valor.categoria ? Number(valor.categoria) : null,
    descripcion: valor.descripcion.trim() || null,
  }
}

// Nombres para mostrar un movimiento ya armado en la lista de "agregados".
export function describirSubmovimiento(valor, opciones) {
  const cuenta = buscarCuenta(opciones, valor.cuenta)
  return {
    cuenta: cuenta?.nombre ?? '',
    origen: subcuentaTieneOrigen(valor.tipo) ? buscarSubcuenta(cuenta, valor.origen)?.nombre : 'Sin asignar',
    destino: subcuentaTieneDestino(valor.tipo) ? buscarSubcuenta(cuenta, valor.destino)?.nombre : null,
  }
}
