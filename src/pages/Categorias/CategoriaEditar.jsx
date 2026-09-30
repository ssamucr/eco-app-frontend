import { useNavigate, useParams } from 'react-router-dom'
import { actualizarCategoria, getCategoriaDetalle } from '../../api/categorias'
import ConfirmDialog from '../../components/ConfirmDialog'
import ErrorCarga from '../../components/ErrorCarga'
import { EncabezadoFormulario, PaginaFormulario, VolverA } from '../../components/forms'
import { useConfirmarEliminacion } from '../../hooks/useConfirmarEliminacion'
import { useRecurso } from '../../hooks/useRecurso'
import CategoriaForm from './CategoriaForm'
import { eliminarCategoriaConfig } from './eliminaciones'
import './categorias.css'

export default function CategoriaEditar() {
  const { idCategoria } = useParams()
  const navigate = useNavigate()
  const { data: categoria, error, loading, recargar } = useRecurso(
    (o) => getCategoriaDetalle(idCategoria, o),
    [idCategoria],
  )
  const { pedir, dialogoProps } = useConfirmarEliminacion()

  const guardar = async (cuerpo) => {
    await actualizarCategoria(idCategoria, cuerpo)
    navigate('/categorias', { state: { aviso: 'Cambios guardados.' } })
  }

  return (
    <PaginaFormulario>
      <VolverA to="/categorias">Categorías</VolverA>
      <EncabezadoFormulario titulo="Editar categoría" subtitulo={categoria?.nombre ?? ' '} />
      {loading && !categoria && <div className="skeleton" style={{ height: 240 }} />}
      {error && <ErrorCarga titulo="No se pudo cargar la categoría" error={error} onReintentar={recargar} />}
      {categoria && (
        <CategoriaForm
          categoria={categoria}
          onGuardar={guardar}
          onEliminar={() =>
            pedir(
              eliminarCategoriaConfig(categoria, () =>
                navigate('/categorias', { state: { aviso: 'Categoría eliminada.' } }),
              ),
            )
          }
        />
      )}
      <ConfirmDialog {...dialogoProps} />
    </PaginaFormulario>
  )
}
