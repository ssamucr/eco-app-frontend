import { Link } from 'react-router-dom'
import { getPlanesDetalle } from '../../api/planes'
import Aviso from '../../components/Aviso'
import ConfirmDialog from '../../components/ConfirmDialog'
import ErrorCarga from '../../components/ErrorCarga'
import Icon from '../../components/Icon'
import { useAviso } from '../../hooks/useAviso'
import { useConfirmarEliminacion } from '../../hooks/useConfirmarEliminacion'
import { useRecurso } from '../../hooks/useRecurso'
import { plural } from '../../lib/format'
import { insigniaPlan } from '../../lib/planes'
import { eliminarPlanConfig } from './eliminaciones'
import './planes.css'

function Fila({ plan, onEliminar }) {
  const insignia = insigniaPlan(plan)
  return (
    <div className="plan">
      <Link to={`/planes-recurrentes/${plan.id_plan}`} className="plan__link">
        <div className="plan__icon">
          <Icon nombre="recurrente" size={18} strokeWidth={1.8} />
        </div>
        <div className="plan__main">
          <p className="plan__name">{plan.nombre}</p>
          {plan.descripcion && <p className="plan__desc">{plan.descripcion}</p>}
        </div>
        <span className={`badge ${insignia.activa ? 'badge--on' : ''}`}>{insignia.texto}</span>
      </Link>
      <div className="plan__actions">
        <Link to={`/planes-recurrentes/${plan.id_plan}/editar`} aria-label={`Editar plan ${plan.nombre}`} className="icon-btn icon-btn--sm">
          <Icon nombre="editar" size={16} strokeWidth={1.6} />
        </Link>
        <button type="button" aria-label={`Eliminar plan ${plan.nombre}`} className="icon-btn icon-btn--sm" onClick={() => onEliminar(plan)}>
          <Icon nombre="eliminar" size={16} strokeWidth={1.6} />
        </button>
      </div>
    </div>
  )
}

export default function Planes() {
  const { data, error, loading, recargar } = useRecurso(getPlanesDetalle)
  const { pedir, dialogoProps } = useConfirmarEliminacion()
  const [aviso, setAviso] = useAviso()

  const eliminar = (plan) =>
    pedir(
      eliminarPlanConfig(plan, () => {
        setAviso('Plan eliminado.')
        recargar()
      }),
    )

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Planes recurrentes</h1>
          <p className="page-subtitle">
            {data ? `${plural(data.length, 'plan', 'planes')} · ` : ''}Distribuyen tu dinero automáticamente entre cuentas y
            subcuentas cuando los ejecutas.
          </p>
        </div>
        <Link to="/planes-recurrentes/nuevo" className="quickbtn quickbtn--primary">
          <Icon nombre="agregar" size={15} strokeWidth={1.9} />
          Nuevo plan
        </Link>
      </div>

      <Aviso mensaje={aviso} onCerrar={() => setAviso(null)} />

      {loading && !data && <div className="skeleton" style={{ height: 88 }} />}
      {error && <ErrorCarga titulo="No se pudieron cargar los planes" error={error} onReintentar={recargar} />}
      {data && data.length === 0 && <p className="empty">Todavía no tienes planes recurrentes.</p>}

      {data && (
        <div className="plans">
          {data.map((plan) => (
            <Fila key={plan.id_plan} plan={plan} onEliminar={eliminar} />
          ))}
        </div>
      )}

      <ConfirmDialog {...dialogoProps} />
    </>
  )
}
