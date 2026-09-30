import { Link, useParams } from 'react-router-dom'
import { getPlanDetalle } from '../../api/planes'
import Aviso from '../../components/Aviso'
import ErrorCarga from '../../components/ErrorCarga'
import Icon from '../../components/Icon'
import { VolverA } from '../../components/forms'
import { useAviso } from '../../hooks/useAviso'
import { useRecurso } from '../../hooks/useRecurso'
import { textoDestino, textoMontoDestino } from '../../lib/planes'
import './planes.css'

export default function PlanDetalle() {
  const { idPlan } = useParams()
  const { data: plan, error, loading, recargar } = useRecurso((o) => getPlanDetalle(idPlan, o), [idPlan])
  const [aviso, setAviso] = useAviso()

  const ejecutable = plan?.activo && plan.destinos_activos > 0

  return (
    <div className="detail">
      <VolverA to="/planes-recurrentes">Planes recurrentes</VolverA>
      <Aviso mensaje={aviso} onCerrar={() => setAviso(null)} />

      {loading && !plan && <div className="skeleton" style={{ height: 320 }} />}
      {error && <ErrorCarga titulo="No se pudo cargar el plan" error={error} onReintentar={recargar} />}

      {plan && (
        <>
          <div className="detail__head">
            <div className="detail__id">
              <div className="plan__icon plan__icon--lg">
                <Icon nombre="recurrente" size={24} strokeWidth={1.8} />
              </div>
              <div>
                <h1 className="detail__name">
                  {plan.nombre}
                  {!plan.activo && <span className="badge badge--inline">Inactivo</span>}
                </h1>
                {plan.descripcion && <p className="detail__sub">{plan.descripcion}</p>}
              </div>
            </div>
            <Link to={`/planes-recurrentes/${plan.id_plan}/editar`} aria-label={`Editar plan ${plan.nombre}`} className="icon-btn">
              <Icon nombre="editar" size={17} strokeWidth={1.6} />
            </Link>
          </div>

          <section className="detail__section">
            <p className="eyebrow">Destinos</p>
            {plan.destinos.length === 0 ? (
              <p className="empty">Este plan todavía no tiene destinos. <Link to={`/planes-recurrentes/${plan.id_plan}/editar`}>Agrega uno</Link>.</p>
            ) : (
              <div className="card dests">
                {plan.destinos.map((d, i) => (
                  <div key={d.id_plan_recurrente_destino} className={`dets ${d.activo ? '' : 'dets--off'}`}>
                    <div className="dets__num">{i + 1}</div>
                    <div className="dets__main">
                      <p className="dets__text">{textoDestino(d)}</p>
                      <p className="dets__detail">{textoMontoDestino(d)}</p>
                    </div>
                    <span className={`badge ${d.activo ? 'badge--on' : ''}`}>{d.activo ? 'Activo' : 'Inactivo'}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="detail__note">
              Al ejecutar el plan, cada destino activo crea la transferencia o el pago correspondiente desde la cuenta de
              origen que elijas y, si tiene subcuenta, la asignación de saldo.
            </p>
          </section>

          <div className="detail__cta">
            {ejecutable ? (
              <Link to={`/planes-recurrentes/${plan.id_plan}/ejecutar`} className="btn btn--primary btn--lg">
                <Icon nombre="ejecutar" size={15} strokeWidth={2} />
                Ejecutar plan
              </Link>
            ) : (
              <p className="detail__note">
                {plan.activo ? 'Activa al menos un destino' : 'Activa el plan'} para poder ejecutarlo.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
