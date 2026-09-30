import { useNavigate, useParams } from 'react-router-dom'
import { actualizarObligacion, getObligacionDetalle, getOpcionesObligacion } from '../../api/obligaciones'
import ConfirmDialog from '../../components/ConfirmDialog'
import ErrorCarga from '../../components/ErrorCarga'
import { EncabezadoFormulario, PaginaFormulario, VolverA } from '../../components/forms'
import { useConfirmarEliminacion } from '../../hooks/useConfirmarEliminacion'
import { useRecurso } from '../../hooks/useRecurso'
import { deshacerLiquidacionConfig, eliminarObligacionConfig } from './eliminaciones'
import ObligacionForm from './ObligacionForm'
import './obligaciones.css'

export default function ObligacionEditar() {
  const { idObligacion } = useParams()
  const navigate = useNavigate()
  const opciones = useRecurso(getOpcionesObligacion)
  const obligacion = useRecurso((o) => getObligacionDetalle(idObligacion, o), [idObligacion])
  const { pedir, dialogoProps } = useConfirmarEliminacion()

  const guardar = async (cuerpo) => {
    await actualizarObligacion(idObligacion, cuerpo)
    navigate('/obligaciones', { state: { aviso: 'Cambios guardados.' } })
  }

  const listo = opciones.data && obligacion.data
  const falla = opciones.error ?? obligacion.error
  const o = obligacion.data

  return (
    <PaginaFormulario>
      <VolverA to="/obligaciones">Obligaciones</VolverA>
      <EncabezadoFormulario
        titulo="Editar obligación"
        subtitulo={o ? [o.concepto, o.persona].filter(Boolean).join(' · ') : ' '}
      />
      {!listo && !falla && <div className="skeleton" style={{ height: 520 }} />}
      {falla && (
        <ErrorCarga
          titulo="No se pudo cargar la obligación"
          error={falla}
          onReintentar={() => {
            opciones.recargar()
            obligacion.recargar()
          }}
        />
      )}
      {listo && (
        <ObligacionForm
          key={o.liquidaciones.length}
          opciones={opciones.data}
          obligacion={o}
          onGuardar={guardar}
          onEliminar={() =>
            pedir(eliminarObligacionConfig(o, () => navigate('/obligaciones', { state: { aviso: 'Obligación eliminada.' } })))
          }
          onDeshacerLiquidacion={(liquidacion) => pedir(deshacerLiquidacionConfig(liquidacion, obligacion.recargar))}
        />
      )}
      <ConfirmDialog {...dialogoProps} />
    </PaginaFormulario>
  )
}
