import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { TAMANO_PAGINA, getMovimientos, getMovimientosSubcuenta } from '../../api/movimientos'
import Aviso from '../../components/Aviso'
import ConfirmDialog from '../../components/ConfirmDialog'
import ErrorCarga from '../../components/ErrorCarga'
import Icon from '../../components/Icon'
import { useConfirmarEliminacion } from '../../hooks/useConfirmarEliminacion'
import { useListaPaginada } from '../../hooks/useListaPaginada'
import { hoyIso, plural, tituloDia } from '../../lib/format'
import { eliminarMovimientoConfig, eliminarMovimientoSubcuentaConfig } from './eliminaciones'
import { MovimientoFila, SubmovimientoFila } from './MovimientoFila'
import './movimientos.css'

const VISTAS = [
  { valor: 'cuentas', etiqueta: 'Transacciones' },
  { valor: 'subcuentas', etiqueta: 'Subcuentas' },
]

// Los movimientos llegan ordenados por fecha: los de un mismo día quedan juntos.
function agruparPorDia(items) {
  const grupos = []
  for (const item of items) {
    const ultimo = grupos[grupos.length - 1]
    if (ultimo && ultimo.fecha === item.fecha) ultimo.items.push(item)
    else grupos.push({ fecha: item.fecha, items: [item] })
  }
  return grupos
}

function Cargando() {
  return (
    <>
      <div className="skeleton" style={{ height: 150 }} />
      <div className="skeleton" style={{ height: 210 }} />
    </>
  )
}

export default function Movimientos() {
  const [params, setParams] = useSearchParams()
  const vista = params.get('vista') === 'subcuentas' ? 'subcuentas' : 'cuentas'
  const location = useLocation()
  const navigate = useNavigate()
  const { pedir, dialogoProps } = useConfirmarEliminacion()
  const [aviso, setAviso] = useState(location.state?.aviso ?? null)
  const hoy = hoyIso()

  const lista = useListaPaginada(
    (pagina, opciones) =>
      (vista === 'cuentas' ? getMovimientos : getMovimientosSubcuenta)(pagina, opciones).then((r) => ({
        items: r.movimientos,
        total: r.total,
      })),
    [vista],
  )

  // El aviso llega por el estado de navegación: se limpia para que no reaparezca al recargar.
  useEffect(() => {
    if (location.state?.aviso) navigate(location.pathname + location.search, { replace: true, state: null })
  }, [location, navigate])

  const tras = (mensaje) => () => {
    setAviso(mensaje)
    lista.reiniciar()
  }
  const grupos = agruparPorDia(lista.items)
  const enSubcuentas = vista === 'subcuentas'

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Movimientos</h1>
          <p className="page-subtitle">
            {lista.cargando && !lista.total
              ? ' '
              : enSubcuentas
                ? `${plural(lista.total, 'movimiento de subcuenta registrado', 'movimientos de subcuenta registrados')}`
                : `${plural(lista.total, 'movimiento registrado', 'movimientos registrados')}`}
          </p>
        </div>
        <div className="quick-actions">
          <Link to="/obligaciones/nueva" className="quickbtn">
            <Icon nombre="obligaciones" size={15} strokeWidth={1.8} />
            Obligación
          </Link>
          <Link to="/transferencias/nueva?tipo=GASTO" className="quickbtn">
            <Icon nombre="menos" size={15} strokeWidth={1.8} />
            Gasto
          </Link>
          <Link to="/transferencias/nueva" className="quickbtn quickbtn--primary">
            <Icon nombre="transferencia" size={15} strokeWidth={1.8} />
            Transferencia
          </Link>
        </div>
      </div>

      <div className="page-toolbar page-toolbar--wrap">
        <Link to="/movimientos/subcuentas/nueva" className="quickbtn quickbtn--lg">
          <Icon nombre="agregar" size={15} strokeWidth={2} />
          Movimiento de subcuenta
        </Link>
        <Link to="/transferencias/nueva" className="quickbtn quickbtn--primary quickbtn--lg">
          <Icon nombre="agregar" size={15} strokeWidth={2} />
          Nueva transferencia
        </Link>
      </div>

      <div className="view-switch" role="radiogroup" aria-label="Qué movimientos ver">
        {VISTAS.map((v) => (
          <button
            key={v.valor}
            type="button"
            role="radio"
            aria-checked={vista === v.valor}
            className={`segmented__option ${vista === v.valor ? 'is-active' : ''}`}
            onClick={() => setParams(v.valor === 'cuentas' ? {} : { vista: v.valor })}
          >
            {v.etiqueta}
          </button>
        ))}
      </div>

      <Aviso mensaje={aviso} onCerrar={() => setAviso(null)} />

      {lista.cargando && lista.items.length === 0 && !lista.error && <Cargando />}
      {lista.error && (
        <ErrorCarga
          titulo="No se pudieron cargar los movimientos"
          error={lista.error}
          onReintentar={lista.items.length ? lista.cargarMas : lista.reiniciar}
        />
      )}
      {!lista.cargando && !lista.error && lista.items.length === 0 && (
        <p className="empty">{enSubcuentas ? 'Todavía no hay movimientos de subcuenta.' : 'Todavía no hay movimientos.'}</p>
      )}

      <div className="days">
        {grupos.map((grupo) => (
          <section key={grupo.fecha}>
            <h2 className="day__title">{tituloDia(grupo.fecha, hoy)}</h2>
            <div className="day__card">
              {grupo.items.map((item) =>
                enSubcuentas ? (
                  <SubmovimientoFila
                    key={item.id_movimiento_subcuenta}
                    movimiento={item}
                    onEliminar={(m) => pedir(eliminarMovimientoSubcuentaConfig(m, tras('Movimiento de subcuenta eliminado.')))}
                  />
                ) : (
                  <MovimientoFila
                    key={item.id_transaccion}
                    movimiento={item}
                    onEliminar={(m) => pedir(eliminarMovimientoConfig(m, tras('Movimiento eliminado.')))}
                  />
                ),
              )}
            </div>
          </section>
        ))}
      </div>

      {lista.hayMas && (
        <div className="load-more">
          <p className="load-more__count">
            Mostrando {lista.items.length} de {lista.total}
          </p>
          <button type="button" className="btn" onClick={lista.cargarMas} disabled={lista.cargandoMas}>
            {lista.cargandoMas ? 'Cargando…' : `Cargar ${Math.min(TAMANO_PAGINA, lista.total - lista.items.length)} más`}
          </button>
        </div>
      )}

      <ConfirmDialog {...dialogoProps} />
    </>
  )
}
