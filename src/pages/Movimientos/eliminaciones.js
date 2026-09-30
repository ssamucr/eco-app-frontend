import { eliminarMovimientoSubcuenta, eliminarTransaccion } from '../../api/movimientos'
import { etiquetaTransaccion } from '../../lib/movimientos'

// `movimiento.movimientos_subcuenta` es un conteo en la lista y un arreglo en el detalle.
export function eliminarMovimientoConfig(movimiento, onExito) {
  const vinculados = Array.isArray(movimiento.movimientos_subcuenta)
    ? movimiento.movimientos_subcuenta.length
    : movimiento.movimientos_subcuenta
  let vinculo = ''
  if (vinculados === 1) vinculo = ' Su movimiento de subcuenta se conserva, sin vínculo.'
  else if (vinculados > 1) vinculo = ` Sus ${vinculados} movimientos de subcuenta se conservan, sin vínculo.`
  return {
    titulo: `Eliminar «${movimiento.descripcion || etiquetaTransaccion(movimiento.tipo)}»`,
    mensaje: `Esta acción no se puede deshacer. Los saldos de las cuentas se recalculan solos.${vinculo}`,
    ejecutar: () => eliminarTransaccion(movimiento.id_transaccion),
    onExito,
  }
}

export function eliminarMovimientoSubcuentaConfig(movimiento, onExito) {
  return {
    titulo: 'Eliminar el movimiento de subcuenta',
    mensaje: 'Se deshace su efecto en el saldo de las subcuentas. Esta acción no se puede deshacer.',
    ejecutar: () => eliminarMovimientoSubcuenta(movimiento.id_movimiento_subcuenta),
    onExito,
  }
}
