import { useNavigate, useParams } from 'react-router-dom'
import { actualizarTransaccion, getMovimiento, getOpcionesMovimiento } from '../../api/movimientos'
import ConfirmDialog from '../../components/ConfirmDialog'
import ErrorCarga from '../../components/ErrorCarga'
import { EncabezadoFormulario, PaginaFormulario, VolverA } from '../../components/forms'
import { useConfirmarEliminacion } from '../../hooks/useConfirmarEliminacion'
import { useRecurso } from '../../hooks/useRecurso'
import { fechaRelativa, hoyIso } from '../../lib/format'
import { etiquetaTransaccion } from '../../lib/movimientos'
import { eliminarMovimientoConfig } from './eliminaciones'
import TransferenciaForm from './TransferenciaForm'
import './movimientos.css'

export default function TransferenciaEditar() {
  const { idTransaccion } = useParams()
  const navigate = useNavigate()
  const opciones = useRecurso(getOpcionesMovimiento)
  const movimiento = useRecurso((o) => getMovimiento(idTransaccion, o), [idTransaccion])
  const { pedir, dialogoProps } = useConfirmarEliminacion()

  const guardar = async (cuerpo) => {
    await actualizarTransaccion(idTransaccion, cuerpo)
    navigate('/movimientos', { state: { aviso: 'Cambios guardados.' } })
  }

  const listo = opciones.data && movimiento.data
  const falla = opciones.error ?? movimiento.error
  const subtitulo = movimiento.data
    ? `${movimiento.data.descripcion || etiquetaTransaccion(movimiento.data.tipo)} · ${fechaRelativa(movimiento.data.fecha, hoyIso())}`
    : ' '

  return (
    <PaginaFormulario>
      <VolverA to="/movimientos">Movimientos</VolverA>
      <EncabezadoFormulario titulo="Editar transferencia" subtitulo={subtitulo} />
      {!listo && !falla && <div className="skeleton" style={{ height: 520 }} />}
      {falla && (
        <ErrorCarga
          titulo="No se pudo cargar el movimiento"
          error={falla}
          onReintentar={() => {
            opciones.recargar()
            movimiento.recargar()
          }}
        />
      )}
      {listo && (
        <TransferenciaForm
          opciones={opciones.data}
          movimiento={movimiento.data}
          onGuardar={guardar}
          onEliminar={() =>
            pedir(
              eliminarMovimientoConfig(movimiento.data, () =>
                navigate('/movimientos', { state: { aviso: 'Movimiento eliminado.' } }),
              ),
            )
          }
        />
      )}
      <ConfirmDialog {...dialogoProps} />
    </PaginaFormulario>
  )
}
