import { deshacerPagoCuota, eliminarCuota, eliminarFinanciamiento } from '../../api/financiamientos'
import { dinero, plural } from '../../lib/format'

export function eliminarFinanciamientoConfig(financiamiento, onExito) {
  const cuotas = financiamiento.cuotas_total
  const pagadas = financiamiento.cuotas_pagadas
  const detalle =
    cuotas === 0
      ? ''
      : `Se eliminan también sus ${plural(cuotas, 'cuota', 'cuotas')}${pagadas ? ` (${pagadas} ya pagadas)` : ''}. Las transacciones con las que las pagaste no cambian. `
  return {
    titulo: `Eliminar el financiamiento «${financiamiento.descripcion}»`,
    mensaje: `${detalle}Esta acción no se puede deshacer.`,
    ejecutar: () => eliminarFinanciamiento(financiamiento.id_financiamiento),
    onExito,
  }
}

export function eliminarCuotaConfig(cuota, onExito) {
  return {
    titulo: `Eliminar la cuota ${cuota.numero_cuota}`,
    mensaje: cuota.pagada
      ? `Ya está pagada (${dinero(cuota.monto)}). Se elimina la cuota; la transacción de pago no cambia. Esta acción no se puede deshacer.`
      : 'Esta acción no se puede deshacer.',
    ejecutar: () => eliminarCuota(cuota.id_cuota_financiamiento),
    onExito,
  }
}

export function deshacerPagoConfig(cuota, onExito) {
  return {
    titulo: `Deshacer el pago de la cuota ${cuota.numero_cuota}`,
    mensaje: 'La cuota vuelve a quedar pendiente. La transacción con la que la pagaste no cambia.',
    etiquetaConfirmar: 'Deshacer pago',
    ejecutar: () => deshacerPagoCuota(cuota.id_cuota_financiamiento),
    onExito,
  }
}
