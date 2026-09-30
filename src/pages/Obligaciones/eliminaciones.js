import { eliminarLiquidacion, eliminarObligacion } from '../../api/obligaciones'
import { dinero, fechaCorta } from '../../lib/format'

export function eliminarObligacionConfig(obligacion, onExito) {
  const conLiquidaciones = obligacion.monto_liquidado > 0
  return {
    titulo: `Eliminar la obligación «${obligacion.concepto || 'sin concepto'}»`,
    mensaje: conLiquidaciones
      ? `Ya tiene ${dinero(obligacion.monto_liquidado)} liquidados: esas liquidaciones se eliminan con ella. Esta acción no se puede deshacer.`
      : 'Esta acción no se puede deshacer.',
    ejecutar: () => eliminarObligacion(obligacion.id_obligacion),
    onExito,
  }
}

export function deshacerLiquidacionConfig(liquidacion, onExito) {
  return {
    titulo: 'Deshacer la liquidación',
    mensaje: `Se elimina la liquidación de ${dinero(liquidacion.monto)} del ${fechaCorta(liquidacion.fecha)} y ese monto vuelve a quedar pendiente.`,
    ejecutar: () => eliminarLiquidacion(liquidacion.id_liquidacion),
    onExito,
  }
}
