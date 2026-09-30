import { eliminarPlan } from '../../api/planes'
import { plural } from '../../lib/format'

export function eliminarPlanConfig(plan, onExito) {
  const destinos = plan.destinos_total
  return {
    titulo: `Eliminar el plan «${plan.nombre}»`,
    mensaje:
      destinos > 0
        ? `Se eliminan también sus ${plural(destinos, 'destino', 'destinos')}. Los movimientos que ya se hayan creado al ejecutarlo no cambian. Esta acción no se puede deshacer.`
        : 'Esta acción no se puede deshacer.',
    ejecutar: () => eliminarPlan(plan.id_plan),
    onExito,
  }
}
