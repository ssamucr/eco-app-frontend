import { eliminarPersona } from '../../api/personas'
import { plural } from '../../lib/format'

export function eliminarPersonaConfig(persona, onExito) {
  let mensaje = 'Esta acción no se puede deshacer.'
  if (persona.pendientes > 0) {
    mensaje = `Tiene ${plural(persona.pendientes, 'obligación pendiente', 'obligaciones pendientes')}: liquídalas antes de eliminarla.`
  } else if (persona.liquidadas > 0) {
    mensaje += ` Sus ${plural(persona.liquidadas, 'obligación liquidada', 'obligaciones liquidadas')} se conservan, sin persona.`
  }
  return {
    titulo: `Eliminar a «${persona.nombre}»`,
    mensaje,
    ejecutar: () => eliminarPersona(persona.id_persona),
    onExito,
  }
}
