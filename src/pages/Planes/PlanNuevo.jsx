import { useNavigate } from 'react-router-dom'
import { crearPlan } from '../../api/planes'
import { getOpcionesMovimiento } from '../../api/movimientos'
import ErrorCarga from '../../components/ErrorCarga'
import { EncabezadoFormulario, PaginaFormulario, VolverA } from '../../components/forms'
import { useRecurso } from '../../hooks/useRecurso'
import PlanForm from './PlanForm'
import './planes.css'

export default function PlanNuevo() {
  const navigate = useNavigate()
  const { data: opciones, error, loading, recargar } = useRecurso(getOpcionesMovimiento)

  const guardar = async (cuerpo) => {
    await crearPlan(cuerpo)
    navigate('/planes-recurrentes', { state: { aviso: 'Plan creado.' } })
  }

  return (
    <PaginaFormulario>
      <VolverA to="/planes-recurrentes">Planes recurrentes</VolverA>
      <EncabezadoFormulario
        titulo="Nuevo plan"
        subtitulo="Registra un plan que distribuya dinero automáticamente entre cuentas y subcuentas cuando lo ejecutes."
      />
      {loading && !opciones && <div className="skeleton" style={{ height: 420 }} />}
      {error && <ErrorCarga titulo="No se pudieron cargar los datos" error={error} onReintentar={recargar} />}
      {opciones && <PlanForm opciones={opciones} onGuardar={guardar} />}
    </PaginaFormulario>
  )
}
