import { eliminarConfigCiclos } from '../../api/ciclos'

export function eliminarConfigConfig(config, onExito) {
  return {
    titulo: `Eliminar «${config.nombre}»`,
    mensaje: 'Se eliminan también todos sus ciclos. Tus movimientos no cambian. Esta acción no se puede deshacer.',
    ejecutar: () => eliminarConfigCiclos(config.id_ciclo_config),
    onExito,
  }
}
