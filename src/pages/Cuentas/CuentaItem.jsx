import { Link } from 'react-router-dom'
import Icon from '../../components/Icon'
import UsoTarjeta from '../../components/UsoTarjeta'
import { COLOR_SIN_ASIGNAR, TARJETA, colorSubcuenta, etiquetaTipo } from '../../lib/cuentas'
import { dinero } from '../../lib/format'
import SubcuentasFilas from './SubcuentasFilas'

function BarraSubcuentas({ cuenta }) {
  const segmentos = cuenta.subcuentas
    .map((sub, i) => ({ clave: sub.id_subcuenta, pct: sub.porcentaje, color: colorSubcuenta(i) }))
    .concat({ clave: 'libre', pct: cuenta.porcentaje_sin_asignar, color: COLOR_SIN_ASIGNAR })
    .filter((s) => s.pct > 0)
  return (
    <div className="segments segments--thin segments--track" aria-hidden="true">
      {segmentos.map((s) => (
        <div key={s.clave} style={{ flex: `${s.pct} 0 0`, background: s.color }} />
      ))}
    </div>
  )
}

export default function CuentaItem({ cuenta, onEliminarCuenta, onEliminarSubcuenta }) {
  const esTarjeta = cuenta.tipo === TARJETA
  const tieneSubcuentas = cuenta.subcuentas.length > 0
  const agregar = (
    <Link to={`/cuentas/${cuenta.id_cuenta}/subcuentas/nueva`} className="dashed-btn">
      <Icon nombre="agregar" size={14} strokeWidth={2} />
      Agregar subcuenta
    </Link>
  )

  return (
    <div className="card">
      <div className="account__head">
        <div className="account__id">
          <div className={`tile ${esTarjeta ? 'tile--neutral' : ''}`}>
            <Icon nombre={esTarjeta ? 'tarjeta' : 'cartera'} size={19} strokeWidth={1.6} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p className="account__name">{cuenta.nombre}</p>
            {cuenta.entidad && <p className="account__entity">{cuenta.entidad}</p>}
          </div>
        </div>

        <div className="account__side">
          <div className="account__actions">
            <Link to={`/cuentas/${cuenta.id_cuenta}/editar`} aria-label={`Editar ${cuenta.nombre}`} className="icon-btn">
              <Icon nombre="editar" size={16} strokeWidth={1.6} />
            </Link>
            <button
              type="button"
              aria-label={`Eliminar ${cuenta.nombre}`}
              className="icon-btn"
              onClick={() => onEliminarCuenta(cuenta)}
            >
              <Icon nombre="eliminar" size={16} strokeWidth={1.6} />
            </button>
          </div>
          <div className="account__balance">
            <span className="chip chip--tight">{etiquetaTipo(cuenta.tipo)}</span>
            <p className={`account__amount num ${!esTarjeta && cuenta.saldo < 0 ? 'negative' : ''}`}>
              {dinero(cuenta.saldo)}
            </p>
          </div>
        </div>
      </div>

      {esTarjeta && <UsoTarjeta cuenta={cuenta} />}

      {!esTarjeta && (
        <>
          <div className="account__divider" />
          {tieneSubcuentas ? (
            <>
              <p className="account__eyebrow">Subcuentas</p>
              <BarraSubcuentas cuenta={cuenta} />
              <SubcuentasFilas cuenta={cuenta} onEliminar={onEliminarSubcuenta} />
              <div className="account__add">{agregar}</div>
            </>
          ) : (
            <div className="account__empty-subs">
              <p className="account__empty-text">Sin subcuentas todavía</p>
              {agregar}
            </div>
          )}
        </>
      )}
    </div>
  )
}
