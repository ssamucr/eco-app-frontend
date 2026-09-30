import { Link, useParams } from 'react-router-dom'
import { getPersonaDetalle } from '../../api/personas'
import ErrorCarga from '../../components/ErrorCarga'
import Icon from '../../components/Icon'
import { VolverA } from '../../components/forms'
import { useRecurso } from '../../hooks/useRecurso'
import { dinero, dineroConSigno, fechaRelativa, hoyIso, plural } from '../../lib/format'
import { estadoBalance } from '../../lib/personas'
import Avatar from './Avatar'
import './personas.css'

const TIPO_OBLIGACION = { POR_COBRAR: 'Por cobrar', POR_PAGAR: 'Por pagar', REPOSICION: 'Reposición' }

function FilaObligacion({ obligacion: o, hoy }) {
  const cobrar = o.tipo !== 'POR_PAGAR'
  const parcial = !o.resuelta && o.monto_pendiente < o.monto
  const meta = [
    TIPO_OBLIGACION[o.tipo] ?? o.tipo,
    fechaRelativa(o.fecha_creacion, hoy),
    parcial && `Pendiente ${dinero(o.monto_pendiente)} de ${dinero(o.monto)}`,
  ]
    .filter(Boolean)
    .join(' · ')
  return (
    <div className={`obligation ${o.resuelta ? 'obligation--done' : ''}`}>
      <div className={`obligation__icon ${cobrar ? 'obligation__icon--in' : 'obligation__icon--out'}`}>
        <Icon nombre="obligaciones" size={16} strokeWidth={1.8} />
      </div>
      <div className="obligation__main">
        <p className="obligation__title">{o.descripcion || 'Obligación'}</p>
        <p className="obligation__meta">{meta}</p>
      </div>
      <p className={`obligation__amount num ${o.resuelta ? '' : cobrar ? 'positive' : 'negative'}`}>
        {o.resuelta ? dinero(o.monto) : dineroConSigno(cobrar ? o.monto_pendiente : -o.monto_pendiente)}
      </p>
      {!o.resuelta && (
        <>
          <Link to={`/obligaciones/${o.id_obligacion}/liquidar`} className="btn btn--small">
            Liquidar
          </Link>
          <Link
            to={`/obligaciones/${o.id_obligacion}/editar`}
            aria-label={`Editar obligación ${o.descripcion || ''}`.trim()}
            className="icon-btn"
          >
            <Icon nombre="editar" size={15} strokeWidth={1.6} />
          </Link>
        </>
      )}
    </div>
  )
}

export default function PersonaDetalle() {
  const { idPersona } = useParams()
  const { data: persona, error, loading, recargar } = useRecurso((o) => getPersonaDetalle(idPersona, o), [idPersona])
  const hoy = hoyIso()

  const pendientes = persona?.obligaciones.filter((o) => !o.resuelta) ?? []
  const liquidadas = persona?.obligaciones.filter((o) => o.resuelta) ?? []
  const estado = persona ? estadoBalance(persona.balance) : null

  return (
    <div className="detail">
      <VolverA to="/personas">Personas</VolverA>

      {loading && !persona && <div className="skeleton" style={{ height: 300 }} />}
      {error && <ErrorCarga titulo="No se pudo cargar la persona" error={error} onReintentar={recargar} />}

      {persona && (
        <>
          <div className="detail__head">
            <div className="detail__id">
              <Avatar persona={persona} grande />
              <div>
                <h1 className="detail__name">{persona.nombre}</h1>
                <p className="detail__sub">
                  {persona.pendientes === 0
                    ? 'Sin obligaciones pendientes'
                    : plural(persona.pendientes, 'obligación pendiente', 'obligaciones pendientes')}
                </p>
              </div>
            </div>
            <Link to={`/personas/${persona.id_persona}/editar`} aria-label={`Editar ${persona.nombre}`} className="icon-btn">
              <Icon nombre="editar" size={17} strokeWidth={1.6} />
            </Link>
          </div>

          <div className="card balance-card">
            <div>
              <p className="balance-card__label">Balance con {persona.nombre}</p>
              <p className={`balance-card__amount num ${estado.clase}`}>{dineroConSigno(persona.balance)}</p>
            </div>
            <span className={`balance-card__chip ${estado.clase ? `balance-card__chip--${estado.clase}` : ''}`}>
              {estado.texto}
            </span>
          </div>

          <section className="detail__section">
            <div className="section-head">
              <h2 className="section-title">Obligaciones</h2>
              <Link to={`/obligaciones/nueva?persona=${persona.id_persona}`} className="quickbtn">
                <Icon nombre="agregar" size={14} strokeWidth={2} />
                Nueva obligación
              </Link>
            </div>
            {pendientes.length === 0 ? (
              <p className="empty">No hay obligaciones pendientes con {persona.nombre}.</p>
            ) : (
              <div className="card obligations">
                {pendientes.map((o) => (
                  <FilaObligacion key={o.id_obligacion} obligacion={o} hoy={hoy} />
                ))}
              </div>
            )}
          </section>

          {liquidadas.length > 0 && (
            <section className="detail__section">
              <h2 className="section-title">Liquidadas ({liquidadas.length})</h2>
              <div className="card obligations">
                {liquidadas.map((o) => (
                  <FilaObligacion key={o.id_obligacion} obligacion={o} hoy={hoy} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
