import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { getCiclos } from '../../api/ciclos'
import { TAMANO_PAGINA, getMovimientos, getMovimientosSubcuenta } from '../../api/movimientos'
import Aviso from '../../components/Aviso'
import ConfirmDialog from '../../components/ConfirmDialog'
import ErrorCarga from '../../components/ErrorCarga'
import Icon from '../../components/Icon'
import { Selector } from '../../components/forms'
import { useConfirmarEliminacion } from '../../hooks/useConfirmarEliminacion'
import { useListaPaginada } from '../../hooks/useListaPaginada'
import { useRecurso } from '../../hooks/useRecurso'
import { hoyIso, plural, rangoFechas, tituloDia } from '../../lib/format'
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

  const idCiclo = params.get('ciclo') ?? ''
  const categoria = params.get('categoria') ?? ''
  const nombreCategoria = params.get('nombre') ?? ''
  const ciclos = useRecurso((o) => getCiclos(null, 36, o))
  const ciclosPasados = (ciclos.data?.ciclos ?? []).filter((c) => c.fecha_inicio <= hoy)
  const cicloElegido = ciclosPasados.find((c) => String(c.id_ciclo) === idCiclo)
  const rango = cicloElegido ? { desde: cicloElegido.fecha_inicio, hasta: cicloElegido.fecha_fin } : null

  const lista = useListaPaginada(
    (pagina, opciones) =>
      (vista === 'cuentas'
        ? getMovimientos(pagina, opciones, rango, categoria)
        : getMovimientosSubcuenta(pagina, opciones, rango)
      ).then((r) => ({
        items: r.movimientos,
        total: r.total,
      })),
    [vista, rango?.desde, rango?.hasta, categoria],
  )

  // Cambiar la vista o el ciclo conserva el otro filtro.
  const cambiarParams = (cambios) => {
    const nuevos = new URLSearchParams(params)
    for (const [clave, valor] of Object.entries(cambios)) {
      if (valor) nuevos.set(clave, valor)
      else nuevos.delete(clave)
    }
    setParams(nuevos)
  }

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
                ? `${plural(lista.total, 'movimiento de subcuenta', 'movimientos de subcuenta')}${rango ? ' en el ciclo' : ' registrados'}`
                : `${plural(lista.total, 'movimiento', 'movimientos')}${rango ? ' en el ciclo' : ' registrados'}`}
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

      <div className="page-toolbar page-toolbar--wrap filtros">
      <div className="view-switch" role="radiogroup" aria-label="Qué movimientos ver">
        {VISTAS.map((v) => (
          <button
            key={v.valor}
            type="button"
            role="radio"
            aria-checked={vista === v.valor}
            className={`segmented__option ${vista === v.valor ? 'is-active' : ''}`}
            onClick={() => cambiarParams({ vista: v.valor === 'cuentas' ? '' : v.valor })}
          >
            {v.etiqueta}
          </button>
        ))}
      </div>
        {categoria && vista === 'cuentas' && (
          <button type="button" className="chip chip--filtro" onClick={() => cambiarParams({ categoria: '', nombre: '' })}>
            Categoría: {nombreCategoria || categoria} <Icon nombre="cerrar" size={12} strokeWidth={2} />
          </button>
        )}
        {ciclosPasados.length > 0 && (
          <div className="filtros__ciclo">
            <Selector
              id="filtro-ciclo"
              valor={idCiclo}
              onChange={(id) => cambiarParams({ ciclo: id })}
              vacio="Todos los movimientos"
              aria-label="Filtrar por ciclo"
              opciones={ciclosPasados.map((c) => ({
                valor: String(c.id_ciclo),
                etiqueta: rangoFechas(c.fecha_inicio, c.fecha_fin),
                detalle: [c.config, c.es_actual && 'Ciclo actual'].filter(Boolean).join(' · '),
              }))}
            />
          </div>
        )}
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
