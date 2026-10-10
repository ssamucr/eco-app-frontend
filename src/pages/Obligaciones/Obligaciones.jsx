import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getObligacionesDetalle } from '../../api/obligaciones'
import Aviso from '../../components/Aviso'
import ConfirmDialog from '../../components/ConfirmDialog'
import ErrorCarga from '../../components/ErrorCarga'
import Icon from '../../components/Icon'
import { useAviso } from '../../hooks/useAviso'
import { useConfirmarEliminacion } from '../../hooks/useConfirmarEliminacion'
import { useRecurso } from '../../hooks/useRecurso'
import { dinero, dineroConSigno, fechaCorta } from '../../lib/format'
import Avatar from '../Personas/Avatar'
import { eliminarObligacionConfig } from './eliminaciones'
import './obligaciones.css'

function metaDe(o) {
  const parcial = !o.resuelta && o.monto_pendiente < o.monto ? `Pendiente ${dinero(o.monto_pendiente)} de ${dinero(o.monto)}` : null
  const destino =
    o.tipo === 'REPOSICION' ? `Reposición → ${[o.cuenta_destino, o.subcuenta_destino].filter(Boolean).join(' · ')}` : null
  const sinPersona = !o.persona && o.tipo !== 'REPOSICION' ? 'Sin persona' : null
  return [o.persona ? o.concepto : destino ?? sinPersona, fechaCorta(o.fecha_creacion), parcial, o.resuelta && 'Liquidada']
    .filter(Boolean)
    .join(' · ')
}

function Fila({ obligacion: o, onEliminar }) {
  const cobrar = o.tipo === 'POR_COBRAR'
  const pagar = o.tipo === 'POR_PAGAR'
  const importe = o.resuelta ? o.monto : o.monto_pendiente
  const nombre = o.persona ?? o.concepto ?? 'Obligación'
  return (
    <div className={`orow ${o.resuelta ? 'orow--done' : ''}`}>
      {o.id_persona ? (
        <Link to={`/personas/${o.id_persona}`} className="orow__who">
          <Avatar persona={{ id_persona: o.id_persona, nombre: o.persona }} />
          <div className="orow__main">
            <p className="orow__title">{nombre}</p>
            <p className="orow__meta">{metaDe(o)}</p>
          </div>
        </Link>
      ) : (
        <div className="orow__who">
          <div className="orow__icon">
            <Icon nombre="obligaciones" size={16} strokeWidth={1.8} />
          </div>
          <div className="orow__main">
            <p className="orow__title">{nombre}</p>
            <p className="orow__meta">{metaDe(o)}</p>
          </div>
        </div>
      )}
      <p className={`orow__amount num ${o.resuelta ? '' : cobrar ? 'positive' : pagar ? 'negative' : ''}`}>
        {o.resuelta || o.tipo === 'REPOSICION' ? dinero(importe) : dineroConSigno(pagar ? -importe : importe)}
      </p>
      {!o.resuelta && (
        <Link to={`/obligaciones/${o.id_obligacion}/liquidar`} className="btn btn--small">
          Liquidar
        </Link>
      )}
      <div className="orow__actions">
        <Link to={`/obligaciones/${o.id_obligacion}/editar`} className="icon-edit" aria-label={`Editar obligación ${nombre}`}>
          <Icon nombre="editar" size={16} strokeWidth={1.8} />
        </Link>
        <button type="button" className="icon-del" aria-label={`Eliminar obligación ${nombre}`} onClick={() => onEliminar(o)}>
          <Icon nombre="eliminar" size={16} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  )
}

function Grupo({ titulo, lista, onEliminar }) {
  if (lista.length === 0) return null
  return (
    <section>
      <h2 className="group-title">{titulo}</h2>
      <div className="card obligs">
        {lista.map((o) => (
          <Fila key={o.id_obligacion} obligacion={o} onEliminar={onEliminar} />
        ))}
      </div>
    </section>
  )
}

export default function Obligaciones() {
  const { data, error, loading, recargar } = useRecurso(getObligacionesDetalle)
  const { pedir, dialogoProps } = useConfirmarEliminacion()
  const [aviso, setAviso] = useAviso()
  const [verLiquidadas, setVerLiquidadas] = useState(false)

  const eliminar = (obligacion) =>
    pedir(
      eliminarObligacionConfig(obligacion, () => {
        setAviso('Obligación eliminada.')
        recargar()
      }),
    )
  const hayPendientes = data && (data.te_deben.length || data.debes.length || data.reposiciones.length) > 0
  const sinNada = data && !data.te_deben.length && !data.debes.length && !data.reposiciones.length

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Obligaciones</h1>
          <p className="page-subtitle">
            {data ? (
              <>
                Balance neto{' '}
                <span className={`strong ${data.balance > 0 ? 'positive' : data.balance < 0 ? 'negative' : ''}`}>
                  {dineroConSigno(data.balance)}
                </span>{' '}
                · Te deben {dinero(data.por_cobrar)} · Debes {dinero(data.por_pagar)}
                {data.reposicion_pendiente > 0 && ` · Reposiciones ${dinero(data.reposicion_pendiente)}`}
              </>
            ) : (
              ' '
            )}
          </p>
        </div>
        <div className="page-header__actions">
          {hayPendientes && (
            <Link to="/obligaciones/liquidar-varias" className="quickbtn">
              <Icon nombre="check" size={15} strokeWidth={1.9} />
              Liquidar varias
            </Link>
          )}
          <Link to="/obligaciones/nueva" className="quickbtn quickbtn--primary">
            <Icon nombre="agregar" size={15} strokeWidth={1.9} />
            Nueva obligación
          </Link>
        </div>
      </div>

      <Aviso mensaje={aviso} onCerrar={() => setAviso(null)} />

      {loading && !data && (
        <>
          <div className="skeleton" style={{ height: 150 }} />
          <div className="skeleton" style={{ height: 110 }} />
        </>
      )}
      {error && <ErrorCarga titulo="No se pudieron cargar las obligaciones" error={error} onReintentar={recargar} />}
      {sinNada && <p className="empty">No hay obligaciones pendientes.</p>}

      {data && (
        <>
          <Grupo titulo="Te deben" lista={data.te_deben} onEliminar={eliminar} />
          <Grupo titulo="Debes" lista={data.debes} onEliminar={eliminar} />
          <Grupo titulo="Reposiciones" lista={data.reposiciones} onEliminar={eliminar} />

          {data.liquidadas.length > 0 && (
            <div className="load-more">
              <button type="button" className="btn" onClick={() => setVerLiquidadas((v) => !v)} aria-expanded={verLiquidadas}>
                {verLiquidadas ? 'Ocultar liquidadas' : `Mostrar liquidadas (${data.liquidadas.length})`}
              </button>
            </div>
          )}
          {verLiquidadas && <Grupo titulo="Liquidadas" lista={data.liquidadas} onEliminar={eliminar} />}
        </>
      )}

      <ConfirmDialog {...dialogoProps} />
    </>
  )
}
