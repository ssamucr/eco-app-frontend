import { eliminarCuenta, eliminarSubcuenta } from '../../api/cuentas'
import { dinero } from '../../lib/format'

export function eliminarCuentaConfig(cuenta, onExito) {
  return {
    titulo: `Eliminar la cuenta «${cuenta.nombre}»`,
    mensaje: 'Esta acción no se puede deshacer.',
    ejecutar: () => eliminarCuenta(cuenta.id_cuenta),
    onExito,
  }
}

export function eliminarSubcuentaConfig(subcuenta, onExito) {
  let historial = ''
  if (subcuenta.movimientos === 1) historial = ' También se borrará su movimiento.'
  else if (subcuenta.movimientos > 1) historial = ` También se borrarán sus ${subcuenta.movimientos} movimientos.`
  return {
    titulo: `Eliminar la subcuenta «${subcuenta.nombre}»`,
    mensaje: `Su saldo de ${dinero(subcuenta.saldo)} volverá a «Sin asignar» en la cuenta.${historial}`,
    ejecutar: () => eliminarSubcuenta(subcuenta.id_subcuenta),
    onExito,
  }
}
