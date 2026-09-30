import { useNavigate, useParams } from 'react-router-dom'
import { actualizarFinanciamiento, getFinanciamientoDetalle, getOpcionesFinanciamiento } from '../../api/financiamientos'
import Aviso from '../../components/Aviso'
import ConfirmDialog from '../../components/ConfirmDialog'
import ErrorCarga from '../../components/ErrorCarga'
import { EncabezadoFormulario, PaginaFormulario, VolverA } from '../../components/forms'
import { useAviso } from '../../hooks/useAviso'
import { useConfirmarEliminacion } from '../../hooks/useConfirmarEliminacion'
import { useRecurso } from '../../hooks/useRecurso'
import { eliminarFinanciamientoConfig } from './eliminaciones'
import FinanciamientoForm from './FinanciamientoForm'
import './financiamientos.css'

export default function FinanciamientoEditar() {
  const { idFinanciamiento } = useParams()
  const navigate = useNavigate()
  const opciones = useRecurso(getOpcionesFinanciamiento)
  const financiamiento = useRecurso((o) => getFinanciamientoDetalle(idFinanciamiento, o), [idFinanciamiento])
  const { pedir, dialogoProps } = useConfirmarEliminacion()
  const [aviso, setAviso] = useAviso()

  const guardar = async (cuerpo) => {
    await actualizarFinanciamiento(idFinanciamiento, cuerpo)
    navigate('/financiamientos', { state: { aviso: 'Cambios guardados.' } })
  }

  const listo = opciones.data && financiamiento.data
  const falla = opciones.error ?? financiamiento.error
  const f = financiamiento.data

  return (
    <PaginaFormulario>
      <VolverA to="/financiamientos">Financiamientos</VolverA>
      <EncabezadoFormulario
        titulo="Editar financiamiento"
        subtitulo={f ? [f.descripcion, f.tarjeta].filter(Boolean).join(' · ') : ' '}
      />
      <Aviso mensaje={aviso} onCerrar={() => setAviso(null)} />
      {!listo && !falla && <div className="skeleton" style={{ height: 520 }} />}
      {falla && (
        <ErrorCarga
          titulo="No se pudo cargar el financiamiento"
          error={falla}
          onReintentar={() => {
            opciones.recargar()
            financiamiento.recargar()
          }}
        />
      )}
      {listo && (
        <FinanciamientoForm
          opciones={opciones.data}
          financiamiento={f}
          onGuardar={guardar}
          onEliminar={() =>
            pedir(
              eliminarFinanciamientoConfig(f, () =>
                navigate('/financiamientos', { state: { aviso: 'Financiamiento eliminado.' } }),
              ),
            )
          }
        />
      )}
      <ConfirmDialog {...dialogoProps} />
    </PaginaFormulario>
  )
}
