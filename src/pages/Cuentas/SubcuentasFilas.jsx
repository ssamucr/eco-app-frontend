import { Link } from 'react-router-dom'
import Icon from '../../components/Icon'
import { COLOR_SIN_ASIGNAR, colorSubcuenta } from '../../lib/cuentas'
import { dinero } from '../../lib/format'

// Filas de subcuentas de una cuenta: con editar y eliminar, la fila "Sin asignar" y el botón para agregar.
export default function SubcuentasFilas({ cuenta, onEliminar }) {
  const { subcuentas, sin_asignar: sinAsignar } = cuenta
  return (
    <>
      {subcuentas.map((sub, i) => (
        <div key={sub.id_subcuenta} className="sub-row">
          <span className="dot" style={{ background: colorSubcuenta(i) }} />
          <div className="sub-row__name">
            <p>{sub.nombre}</p>
          </div>
          <span className="sub-row__amount num">{dinero(sub.saldo)}</span>
          <Link
            to={`/cuentas/${cuenta.id_cuenta}/subcuentas/${sub.id_subcuenta}/editar`}
            aria-label={`Editar subcuenta ${sub.nombre}`}
            className="icon-btn icon-btn--sm"
          >
            <Icon nombre="editar" size={15} strokeWidth={1.6} />
          </Link>
          <button
            type="button"
            aria-label={`Eliminar subcuenta ${sub.nombre}`}
            className="icon-btn icon-btn--sm"
            onClick={() => onEliminar(sub)}
          >
            <Icon nombre="eliminar" size={15} strokeWidth={1.6} />
          </button>
        </div>
      ))}

      {sinAsignar > 0 && subcuentas.length > 0 && (
        <div className="sub-row sub-row--free">
          <span className="dot" style={{ background: COLOR_SIN_ASIGNAR }} />
          <div className="sub-row__name">
            <p>Sin asignar</p>
            <p className="sub-row__hint">Disponible para nuevas subcuentas</p>
          </div>
          <span className="sub-row__amount num">{dinero(sinAsignar)}</span>
        </div>
      )}
      {sinAsignar < 0 && (
        <div className="sub-row">
          <span className="dot" style={{ background: 'var(--negative)' }} />
          <div className="sub-row__name">
            <p>Asignado de más</p>
            <p className="sub-row__hint">Las subcuentas suman más que el saldo de la cuenta</p>
          </div>
          <span className="sub-row__amount num negative">{dinero(sinAsignar)}</span>
        </div>
      )}
    </>
  )
}
