import { useNavigate, useParams } from 'react-router-dom'
import { actualizarCuota, getCuotaDetalle, getFinanciamientosDetalle } from '../../api/financiamientos'
import ConfirmDialog from '../../components/ConfirmDialog'
import ErrorCarga from '../../components/ErrorCarga'
import { EncabezadoFormulario, PaginaFormulario, VolverA } from '../../components/forms'
import { useConfirmarEliminacion } from '../../hooks/useConfirmarEliminacion'
import { useRecurso } from '../../hooks/useRecurso'
import CuotaForm from './CuotaForm'
import { deshacerPagoConfig, eliminarCuotaConfig } from './eliminaciones'
import './financiamientos.css'

export default function CuotaEditar() {
  const { idCuota } = useParams()
  const navigate = useNavigate()
  const lista = useRecurso(getFinanciamientosDetalle)
  const cuota = useRecurso((o) => getCuotaDetalle(idCuota, o), [idCuota])
  const { pedir, dialogoProps } = useConfirmarEliminacion()

  const q = cuota.data
  const volver = q ? `/financiamientos/${q.id_financiamiento}/editar` : '/financiamientos'
  const listo = lista.data && q
  const falla = lista.error ?? cuota.error

  const guardar = async (cuerpo) => {
    await actualizarCuota(idCuota, cuerpo)
    navigate(`/financiamientos/${cuerpo.id_financiamiento}/editar`, { state: { aviso: 'Cambios guardados.' } })
  }

  return (
    <PaginaFormulario>
      <VolverA to={volver}>Financiamiento</VolverA>
      <EncabezadoFormulario
        titulo="Editar cuota"
        subtitulo={q ? `${q.financiamiento} · Cuota ${q.numero_cuota} de ${q.numero_cuotas}` : ' '}
      />
      {!listo && !falla && <div className="skeleton" style={{ height: 420 }} />}
      {falla && (
        <ErrorCarga
          titulo="No se pudo cargar la cuota"
          error={falla}
          onReintentar={() => {
            lista.recargar()
            cuota.recargar()
          }}
        />
      )}
      {listo && (
        <CuotaForm
          financiamientos={lista.data}
          cuota={q}
          onGuardar={guardar}
          onEliminar={() => pedir(eliminarCuotaConfig(q, () => navigate(volver, { state: { aviso: 'Cuota eliminada.' } })))}
          onDeshacerPago={() => pedir(deshacerPagoConfig(q, cuota.recargar))}
        />
      )}
      <ConfirmDialog {...dialogoProps} />
    </PaginaFormulario>
  )
}
