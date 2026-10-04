import { Link } from 'react-router-dom'
import Icon from '../../components/Icon'
import { dinero, plural } from '../../lib/format'
import { estiloPorTipo, estiloPorTipoSubcuenta, etiquetaSubcuenta, etiquetaTransaccion } from '../../lib/movimientos'
import { flujoSubcuenta } from './SubmovimientosVinculados'

function Fila({ icono, claseIcono, titulo, meta, monto, acciones }) {
  return (
    <div className="movrow">
      <div className={`movrow__icon ${claseIcono ? `movrow__icon--${claseIcono}` : ''}`}>
        <Icon nombre={icono} size={16} strokeWidth={1.8} />
      </div>
      <div className="movrow__main">
        <p className="movrow__title">{titulo}</p>
        <p className="movrow__meta">{meta}</p>
      </div>
      {monto}
      <div className="movrow__actions">{acciones}</div>
    </div>
  )
}

function Monto({ signo, valor }) {
  const clase = signo === '-' ? 'negative' : signo === '+' ? 'positive' : ''
  return (
    <p className={`movrow__amount num ${clase}`}>
      {signo === '-' ? '−' : signo === '+' ? '+' : ''}
      {dinero(valor)}
    </p>
  )
}

function cuentasDe(m) {
  if (m.tipo === 'GASTO') return m.cuenta_origen
  if (m.tipo === 'INGRESO') return m.cuenta_destino
  return [m.cuenta_origen, m.cuenta_destino].filter(Boolean).join(' → ')
}

export function MovimientoFila({ movimiento: m, onEliminar }) {
  const { icono, clase } = estiloPorTipo(m.tipo)
  const vinculados = m.movimientos_subcuenta > 0 ? plural(m.movimientos_subcuenta, 'mov. de subcuenta', 'movs. de subcuenta') : null
  return (
    <Fila
      icono={icono}
      claseIcono={clase}
      titulo={m.descripcion || etiquetaTransaccion(m.tipo)}
      meta={[m.descripcion && etiquetaTransaccion(m.tipo), m.categoria, cuentasDe(m), vinculados].filter(Boolean).join(' · ')}
      monto={<Monto signo={m.tipo === 'GASTO' ? '-' : m.tipo === 'INGRESO' ? '+' : ''} valor={m.monto} />}
      acciones={
        <>
          <Link to={`/transferencias/${m.id_transaccion}/editar`} className="icon-edit" aria-label={`Editar ${m.descripcion || 'movimiento'}`}>
            <Icon nombre="editar" size={16} strokeWidth={1.8} />
          </Link>
          <button type="button" className="icon-del" aria-label={`Eliminar ${m.descripcion || 'movimiento'}`} onClick={() => onEliminar(m)}>
            <Icon nombre="eliminar" size={16} strokeWidth={1.8} />
          </button>
        </>
      }
    />
  )
}

export function SubmovimientoFila({ movimiento: m, onEliminar }) {
  const esGasto = m.tipo === 'GASTO'
  const { icono, clase } = estiloPorTipoSubcuenta(m.tipo)
  return (
    <Fila
      icono={icono}
      claseIcono={clase}
      titulo={m.descripcion || etiquetaSubcuenta(m.tipo)}
      meta={[
        m.descripcion && etiquetaSubcuenta(m.tipo),
        flujoSubcuenta(m.tipo, m.subcuenta_origen, m.subcuenta_destino),
        m.cuenta,
        m.categoria,
        m.transaccion && `Vinculado a «${m.transaccion}»`,
      ]
        .filter(Boolean)
        .join(' · ')}
      monto={<Monto signo={esGasto ? '-' : ''} valor={m.monto} />}
      acciones={
        <button type="button" className="icon-del" aria-label="Eliminar movimiento de subcuenta" onClick={() => onEliminar(m)}>
          <Icon nombre="eliminar" size={16} strokeWidth={1.8} />
        </button>
      }
    />
  )
}
