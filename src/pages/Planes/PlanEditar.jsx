import { useNavigate, useParams } from 'react-router-dom'
import { getOpcionesMovimiento } from '../../api/movimientos'
import { actualizarPlan, getPlanDetalle } from '../../api/planes'
import ConfirmDialog from '../../components/ConfirmDialog'
import ErrorCarga from '../../components/ErrorCarga'
import { EncabezadoFormulario, PaginaFormulario, VolverA } from '../../components/forms'
import { useConfirmarEliminacion } from '../../hooks/useConfirmarEliminacion'
import { useRecurso } from '../../hooks/useRecurso'
import { eliminarPlanConfig } from './eliminaciones'
import PlanForm from './PlanForm'
import './planes.css'

export default function PlanEditar() {
  const { idPlan } = useParams()
  const navigate = useNavigate()
  const opciones = useRecurso(getOpcionesMovimiento)
  const plan = useRecurso((o) => getPlanDetalle(idPlan, o), [idPlan])
  const { pedir, dialogoProps } = useConfirmarEliminacion()

  const guardar = async (cuerpo) => {
    await actualizarPlan(idPlan, cuerpo)
    navigate(`/planes-recurrentes/${idPlan}`, { state: { aviso: 'Cambios guardados.' } })
  }

  const listo = opciones.data && plan.data
  const falla = opciones.error ?? plan.error

  return (
    <PaginaFormulario>
      <VolverA to="/planes-recurrentes">Planes recurrentes</VolverA>
      <EncabezadoFormulario titulo="Editar plan" subtitulo={plan.data?.nombre ?? ' '} />
      {!listo && !falla && <div className="skeleton" style={{ height: 420 }} />}
      {falla && (
        <ErrorCarga
          titulo="No se pudo cargar el plan"
          error={falla}
          onReintentar={() => {
            opciones.recargar()
            plan.recargar()
          }}
        />
      )}
      {listo && (
        <PlanForm
          plan={plan.data}
          opciones={opciones.data}
          onGuardar={guardar}
          onEliminar={() =>
            pedir(
              eliminarPlanConfig(plan.data, () =>
                navigate('/planes-recurrentes', { state: { aviso: 'Plan eliminado.' } }),
              ),
            )
          }
        />
      )}
      <ConfirmDialog {...dialogoProps} />
    </PaginaFormulario>
  )
}
