import { Link } from 'react-router-dom'
import { getFinanciamientosDetalle } from '../../api/financiamientos'
import Aviso from '../../components/Aviso'
import ConfirmDialog from '../../components/ConfirmDialog'
import ErrorCarga from '../../components/ErrorCarga'
import Icon from '../../components/Icon'
import { useAviso } from '../../hooks/useAviso'
import { useConfirmarEliminacion } from '../../hooks/useConfirmarEliminacion'
import { useRecurso } from '../../hooks/useRecurso'
import { dinero, fechaCorta, plural } from '../../lib/format'
import { eliminarFinanciamientoConfig } from './eliminaciones'
import './financiamientos.css'

function Fila({ financiamiento: f, onEliminar }) {
  const meta = [
    f.tarjeta,
    `desde ${fechaCorta(f.fecha_inicio)}`,
    f.tasa_interes != null && `${f.tasa_interes}% mensual`,
  ]
    .filter(Boolean)
    .join(' · ')
  return (
    <div className="fin">
      <Link to={`/financiamientos/${f.id_financiamiento}/editar`} className="fin__link">
        <div className="fin__icon">
          <Icon nombre="tarjeta" size={18} strokeWidth={1.8} />
        </div>
        <div className="fin__main">
          <p className="fin__name">{f.descripcion}</p>
          <p className="fin__meta">{meta}</p>
        </div>
        <div className="fin__side">
          <p className="fin__amount num">{dinero(f.monto_total)}</p>
          <p className="fin__progress">
            {f.cuotas_total === 0 ? 'Sin cuotas' : `${f.cuotas_pagadas} de ${f.cuotas_total} cuotas pagadas`}
          </p>
        </div>
      </Link>
      <div className="fin__actions">
        <Link to={`/financiamientos/${f.id_financiamiento}/editar`} aria-label={`Editar financiamiento ${f.descripcion}`} className="icon-btn icon-btn--sm">
          <Icon nombre="editar" size={16} strokeWidth={1.6} />
        </Link>
        <button type="button" aria-label={`Eliminar financiamiento ${f.descripcion}`} className="icon-btn icon-btn--sm" onClick={() => onEliminar(f)}>
          <Icon nombre="eliminar" size={16} strokeWidth={1.6} />
        </button>
      </div>
    </div>
  )
}

export default function Financiamientos() {
  const { data, error, loading, recargar } = useRecurso(getFinanciamientosDetalle)
  const { pedir, dialogoProps } = useConfirmarEliminacion()
  const [aviso, setAviso] = useAviso()

  const eliminar = (financiamiento) =>
    pedir(
      eliminarFinanciamientoConfig(financiamiento, () => {
        setAviso('Financiamiento eliminado.')
        recargar()
      }),
    )

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Financiamientos</h1>
          <p className="page-subtitle">
            {data ? `${plural(data.length, 'financiamiento', 'financiamientos')} · ` : ''}Compras grandes en tarjeta que
            difieres en cuotas, en vez de pagarlas dentro del mes.
          </p>
        </div>
        <Link to="/financiamientos/nuevo" className="quickbtn quickbtn--primary">
          <Icon nombre="agregar" size={15} strokeWidth={1.9} />
          Nuevo financiamiento
        </Link>
      </div>

      <Aviso mensaje={aviso} onCerrar={() => setAviso(null)} />

      {loading && !data && <div className="skeleton" style={{ height: 88 }} />}
      {error && <ErrorCarga titulo="No se pudieron cargar los financiamientos" error={error} onReintentar={recargar} />}
      {data && data.length === 0 && <p className="empty">Todavía no tienes financiamientos.</p>}

      {data && (
        <div className="fins">
          {data.map((f) => (
            <Fila key={f.id_financiamiento} financiamiento={f} onEliminar={eliminar} />
          ))}
        </div>
      )}

      <ConfirmDialog {...dialogoProps} />
    </>
  )
}
