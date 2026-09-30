import { Link } from 'react-router-dom'
import { dinero, dineroConSigno, iniciales } from '../../lib/format'
import { colorAvatar } from '../../lib/personas'

export default function ObligacionesResumen({ obligaciones }) {
  const { balance, personas } = obligaciones
  return (
    <div className="card">
      <div className="debts__head">
        <h2 className="section-title">Obligaciones</h2>
        <p className={`debts__balance num ${balance > 0 ? 'positive' : balance < 0 ? 'negative' : ''}`}>
          {dineroConSigno(balance)}
        </p>
      </div>

      {personas.length === 0 ? (
        <p className="empty" style={{ marginTop: 16 }}>
          No hay obligaciones pendientes con personas.
        </p>
      ) : (
        <div className="debts__list">
          {personas.map((p) => (
            <div key={p.id_persona ?? 'sin-persona'} className="debt">
              <div className="avatar" style={{ background: colorAvatar(p.id_persona) }}>
                {iniciales(p.nombre)}
              </div>
              <div className="debt__main">
                <p className="debt__name">{p.nombre}</p>
                {p.concepto && <p className="debt__concept">{p.concepto}</p>}
              </div>
              <div className="debt__side">
                <p className={`debt__amount num ${p.monto > 0 ? 'positive' : 'negative'}`}>{dineroConSigno(p.monto)}</p>
                <p className="debt__dir">{p.monto > 0 ? 'te debe' : 'le debes'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link to="/obligaciones" className="link debts__more">
        Ver todas las obligaciones
      </Link>
    </div>
  )
}
