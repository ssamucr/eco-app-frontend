import { eliminarCategoria } from '../../api/categorias'
import { plural } from '../../lib/format'

export function eliminarCategoriaConfig(categoria, onExito) {
  const usos = categoria.movimientos
  const efecto =
    usos === 0
      ? 'No la usa ningún movimiento.'
      : `${usos === 1 ? 'El movimiento que la usa quedará' : `Los ${plural(usos, 'movimiento', 'movimientos')} que la usan quedarán`} sin categoría.`
  return {
    titulo: `Eliminar la categoría «${categoria.nombre}»`,
    mensaje: `${efecto} Esta acción no se puede deshacer.`,
    ejecutar: () => eliminarCategoria(categoria.id_categoria),
    onExito,
  }
}
