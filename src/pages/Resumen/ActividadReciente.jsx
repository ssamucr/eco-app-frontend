import { Link } from 'react-router-dom'
import Icon from '../../components/Icon'
import { dinero, fechaRelativa } from '../../lib/format'

const TITULO_POR_TIPO = {
  GASTO: 'Gasto',
  INGRESO: 'Ingreso',
  TRANSFERENCIA: 'Transferencia',
  PAGO_TARJETA: 'Pago de tarjeta',
}

function estiloPorTipo(tipo) {
  switch (tipo) {
    case 'GASTO':
      return { icono: 'menos', clase: 'actrow__icon--expense' }
    case 'INGRESO':
      return { icono: 'mas', clase: 'actrow__icon--income' }
    case 'PAGO_TARJETA':
      return { icono: 'tarjeta', clase: '' }
    default:
      return { icono: 'transferencia', clase: '' }
  }
}

function detalle(t, hoy) {
  const fecha = fechaRelativa(t.fecha, hoy)
  switch (t.tipo) {
    case 'GASTO':
      return [t.categoria, t.cuenta_origen, fecha]
    case 'INGRESO':
      return [t.categoria, t.cuenta_destino, fecha]
    default:
      return [[t.cuenta_origen, t.cuenta_destino].filter(Boolean).join(' → '), fecha]
  }
}

function Monto({ tipo, monto }) {
  if (tipo === 'GASTO') return <p className="actrow__amount negative num">{`−${dinero(monto)}`}</p>
  if (tipo === 'INGRESO') return <p className="actrow__amount positive num">{`+${dinero(monto)}`}</p>
  return <p className="actrow__amount num">{dinero(monto)}</p>
}

export default function ActividadReciente({ transacciones, hoy }) {
  return (
    <div className="card activity">
      <div className="section-head">
        <h2 className="section-title">Actividad reciente</h2>
        <Link to="/movimientos" className="link">
          Ver todo
        </Link>
      </div>

      {transacciones.length === 0 && <p className="empty">Todavía no hay movimientos.</p>}

      {transacciones.map((t) => {
        const { icono, clase } = estiloPorTipo(t.tipo)
        return (
          <div key={t.id_transaccion} className="actrow">
            <div className={`actrow__icon ${clase}`}>
              <Icon nombre={icono} size={16} strokeWidth={1.8} />
            </div>
            <div className="actrow__main">
              <p className="actrow__title">{t.descripcion || TITULO_POR_TIPO[t.tipo] || t.tipo}</p>
              <p className="actrow__meta">{detalle(t, hoy).filter(Boolean).join(' · ')}</p>
            </div>
            <Monto tipo={t.tipo} monto={t.monto} />
          </div>
        )
      })}
    </div>
  )
}
