import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { dinero, diaMes, fechaCorta, plural, rangoFechas } from '../../lib/format'
import Icon from '../../components/Icon'
import ExportarMenu from './ExportarMenu'

export const COLOR = {
  ingresos: '#1baf7a',
  gastos: '#eb6834',
  azul: '#2a78d6',
  gris: '#a3a29a',
  ambar: '#eda100',
}

const compacto = (v) => {
  const n = Number(v) || 0
  const absoluto = Math.abs(n)
  const texto = absoluto >= 1000 ? `${(absoluto / 1000).toFixed(absoluto >= 10000 ? 0 : 1)}k` : Math.round(absoluto)
  return `${n < 0 ? '−' : ''}$${texto}`
}
const tooltipDinero = (valor) => dinero(valor)

// Tarjeta de una sección, con su propio botón para exportarla.
export function Tarjeta({ titulo, subtitulo, secciones, exportar, children, ancha = false }) {
  return (
    <section className={`card an-card ${ancha ? 'an-card--ancha' : ''}`}>
      <div className="an-card__head">
        <div>
          <h2 className="section-title">{titulo}</h2>
          {subtitulo && <p className="an-card__sub">{subtitulo}</p>}
        </div>
        {secciones && <ExportarMenu secciones={secciones} {...exportar} />}
      </div>
      {children}
    </section>
  )
}

function Variacion({ pct, invertir = false, texto }) {
  if (pct == null) return <p className="kpi__note">{texto.vacio}</p>
  const sube = pct > 0
  const bueno = invertir ? !sube : sube
  const clase = pct === 0 ? 'kpi__trend--neutral' : bueno ? 'positive' : 'negative'
  return (
    <div className={`kpi__trend ${clase}`}>
      {pct !== 0 && (
        <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
          <path d={sube ? 'M5 1l4 5H1z' : 'M5 9L1 4h8z'} />
        </svg>
      )}
      <span>
        {Math.abs(pct).toFixed(1)}% {texto.con}
      </span>
    </div>
  )
}

export function Kpis({ datos }) {
  const { kpis, situacion, promedios } = datos
  return (
    <div className="kpi-row">
      <div className="card">
        <p className="kpi__label">Ingresos del ciclo</p>
        <p className="kpi__value positive">{dinero(kpis.ingresos)}</p>
        <Variacion pct={kpis.ingresos_variacion_pct} texto={{ con: 'vs. ciclo anterior', vacio: 'Sin ciclo anterior' }} />
      </div>
      <div className="card">
        <p className="kpi__label">Gastos del ciclo</p>
        <p className="kpi__value">{dinero(kpis.gastos)}</p>
        <Variacion pct={kpis.gastos_variacion_pct} invertir texto={{ con: 'vs. ciclo anterior', vacio: 'Sin ciclo anterior' }} />
      </div>
      <div className="card">
        <p className="kpi__label">Tasa de ahorro</p>
        <p className={`kpi__value ${kpis.tasa_ahorro == null ? '' : kpis.tasa_ahorro < 0 ? 'negative' : 'positive'}`}>
          {kpis.tasa_ahorro == null ? '—' : `${kpis.tasa_ahorro.toFixed(1)}%`}
        </p>
        <p className="kpi__note">
          Balance {dinero(kpis.balance)}
          {promedios.tasa_ahorro != null && ` · promedio ${promedios.tasa_ahorro.toFixed(0)}%`}
        </p>
      </div>
      <div className="card">
        <p className="kpi__label">Patrimonio neto</p>
        <p className={`kpi__value ${situacion.patrimonio_neto < 0 ? 'negative' : ''}`}>{dinero(situacion.patrimonio_neto)}</p>
        <p className="kpi__note">
          Ahorro {dinero(situacion.ahorro)} · deuda {dinero(situacion.deuda)}
          {situacion.cobertura_dias != null && ` · cubre ${plural(situacion.cobertura_dias, 'día', 'días')} de gasto`}
        </p>
      </div>
    </div>
  )
}

const ETIQUETA_NIVEL = { alerta: 'Atención', info: 'Dato', ok: 'Bien' }

// Una línea de la explicación que contiene una cuenta (=, ÷, ×) se resalta para distinguirla del texto.
const esCuenta = (linea) => /[=÷×]/.test(linea) && /\d/.test(linea)

function Insight({ insight }) {
  const [abierto, setAbierto] = useState(false)
  const lineas = insight.explicacion ?? []
  return (
    <li className={`insight insight--${insight.nivel} ${abierto ? 'is-open' : ''}`}>
      <button type="button" className="insight__cabecera" aria-expanded={abierto} onClick={() => setAbierto((v) => !v)}>
        <span className="insight__tag">{ETIQUETA_NIVEL[insight.nivel]}</span>
        <span className="insight__texto">{insight.texto}</span>
        {lineas.length > 0 && (
          <span className="insight__flecha" aria-hidden="true">
            <Icon nombre="siguiente" size={14} strokeWidth={2} />
          </span>
        )}
      </button>
      {abierto && lineas.length > 0 && (
        <div className="insight__detalle">
          <p className="insight__titulo">¿De dónde sale?</p>
          {lineas.map((linea, n) => (
            <p key={n} className={esCuenta(linea) ? 'insight__cuenta' : undefined}>
              {linea}
            </p>
          ))}
        </div>
      )}
    </li>
  )
}

export function Insights({ insights }) {
  if (!insights.length) return <p className="empty">Todavía no hay hallazgos para este ciclo.</p>
  return (
    <>
      <ul className="insights">
        {insights.map((i, n) => (
          <Insight key={n} insight={i} />
        ))}
      </ul>
      <p className="an-nota">Toca un hallazgo para ver cómo se calculó, con tus números.</p>
    </>
  )
}

export function GastosHormiga({ hormiga }) {
  const { umbral, cantidad, total, porcentaje, detalle } = hormiga
  return (
    <>
      <h3 className="an-sub">Gastos hormiga</h3>
      <p className="an-nota an-nota--sinmargen">Compras de hasta {dinero(umbral)}: cada una parece poco, pero juntas pesan en el ciclo.</p>
      {cantidad === 0 ? (
        <p className="empty">Este ciclo no tienes compras de hasta {dinero(umbral)}.</p>
      ) : (
        <>
          <ListaSimple
            filas={detalle.map((h) => ({
              titulo: h.descripcion,
              detalle: h.veces > 1 ? `${h.veces} veces` : '1 vez',
              valor: dinero(h.total),
            }))}
          />
          <p className="an-nota">
            Total: {dinero(total)} en {plural(cantidad, 'compra', 'compras')}
            {porcentaje != null && `, el ${porcentaje.toFixed(1)}% de lo que gastaste este ciclo`}.
          </p>
        </>
      )}
    </>
  )
}

const etiquetaCiclo = (h) => diaMes(h.fecha_inicio)

export function GraficaCiclos({ historial }) {
  const datos = historial.map((h) => ({ ...h, etiqueta: etiquetaCiclo(h) }))
  return (
    <div className="an-chart" role="img" aria-label="Ingresos y gastos por ciclo">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={datos} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#e7e6df" />
          <XAxis dataKey="etiqueta" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={compacto} tick={{ fontSize: 11 }} width={46} />
          <Tooltip formatter={tooltipDinero} labelFormatter={(_, p) => (p[0] ? rangoFechas(p[0].payload.fecha_inicio, p[0].payload.fecha_fin) : '')} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="ingresos" name="Ingresos" fill={COLOR.ingresos} radius={[3, 3, 0, 0]} />
          <Bar dataKey="gastos" name="Gastos" fill={COLOR.gastos} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function GraficaPatrimonio({ historial }) {
  const datos = historial.map((h) => ({ etiqueta: etiquetaCiclo(h), ahorro: h.patrimonio.ahorro, deuda: h.patrimonio.deuda, neto: h.patrimonio.neto, h }))
  return (
    <div className="an-chart" role="img" aria-label="Patrimonio por ciclo">
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={datos} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#e7e6df" />
          <XAxis dataKey="etiqueta" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={compacto} tick={{ fontSize: 11 }} width={46} />
          <Tooltip formatter={tooltipDinero} labelFormatter={(_, p) => (p[0] ? `Al cierre del ciclo ${rangoFechas(p[0].payload.h.fecha_inicio, p[0].payload.h.fecha_fin)}` : '')} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Area type="monotone" dataKey="ahorro" name="Ahorro" stroke={COLOR.ingresos} fill={COLOR.ingresos} fillOpacity={0.12} />
          <Area type="monotone" dataKey="deuda" name="Deuda en tarjetas" stroke={COLOR.gastos} fill={COLOR.gastos} fillOpacity={0.12} />
          <Area type="monotone" dataKey="neto" name="Patrimonio neto" stroke={COLOR.azul} fill={COLOR.azul} fillOpacity={0.08} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function Ritmo({ ritmo }) {
  const hayAnterior = ritmo.puntos.some((p) => p.anterior != null)
  return (
    <>
      <div className="an-chart" role="img" aria-label="Gasto acumulado del ciclo">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={ritmo.puntos} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#e7e6df" />
            <XAxis dataKey="dia" tick={{ fontSize: 11 }} label={{ value: 'Día del ciclo', position: 'insideBottom', offset: -2, fontSize: 11 }} height={34} />
            <YAxis tickFormatter={compacto} tick={{ fontSize: 11 }} width={46} />
            <Tooltip formatter={tooltipDinero} labelFormatter={(d) => `Día ${d}`} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="actual" name="Este ciclo" stroke={COLOR.gastos} strokeWidth={2.4} dot={false} connectNulls={false} />
            {hayAnterior && <Line type="monotone" dataKey="anterior" name="Ciclo anterior" stroke={COLOR.gris} strokeWidth={2} dot={false} />}
            {ritmo.es_actual && ritmo.proyeccion_confiable && (
              <Line type="monotone" dataKey="proyeccion" name="Proyección" stroke={COLOR.gastos} strokeDasharray="5 4" strokeWidth={2} dot={false} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <dl className="an-stats">
        <div>
          <dt>Gastado hasta hoy</dt>
          <dd className="num">{dinero(ritmo.gasto_a_hoy)}</dd>
        </div>
        <div>
          <dt>Ritmo diario</dt>
          <dd className="num">{dinero(ritmo.ritmo_diario)}</dd>
        </div>
        {ritmo.es_actual && ritmo.proyeccion_confiable && ritmo.proyeccion_cierre != null && (
          <div>
            <dt>Proyección al cierre</dt>
            <dd className="num">{dinero(ritmo.proyeccion_cierre)}</dd>
          </div>
        )}
        {ritmo.es_actual && ritmo.disponible_por_dia != null && (
          <div>
            <dt>Para no pasar tu promedio</dt>
            <dd className="num">{dinero(ritmo.disponible_por_dia)} al día</dd>
          </div>
        )}
      </dl>
      {ritmo.es_actual && !ritmo.proyeccion_confiable && (
        <p className="an-nota">
          La proyección aparece después de {plural(4, 'día', 'días')} de ciclo: antes, una sola compra grande la distorsiona.
        </p>
      )}
    </>
  )
}

const claseVariacion = (pct, invertir = true) => {
  if (pct == null || pct === 0) return ''
  return (invertir ? pct < 0 : pct > 0) ? 'positive' : 'negative'
}
const textoVariacion = (pct) => (pct == null ? '—' : `${pct > 0 ? '+' : ''}${pct.toFixed(0)}%`)

export function Categorias({ categorias, ciclo }) {
  if (!categorias.length) return <p className="empty">Sin gastos en este ciclo.</p>
  const maximo = Math.max(...categorias.map((c) => c.total), 1)
  return (
    <div className="an-cats">
      <div className="an-cats__head">
        <span>Categoría</span>
        <span>Total</span>
        <span title="Frente al ciclo anterior">vs. anterior</span>
        <span title="Frente al promedio de tus ciclos completos">vs. promedio</span>
      </div>
      {categorias.map((c) => {
        const fila = (
          <>
            <span className="an-cats__nombre">
              {c.nombre}
              <span className="an-cats__barra">
                <span style={{ width: `${(c.total / maximo) * 100}%` }} />
              </span>
            </span>
            <span className="num an-cats__total">
              {dinero(c.total)}
              <small>{c.porcentaje != null ? `${c.porcentaje.toFixed(0)}%` : ''}</small>
            </span>
            <span className={`num ${claseVariacion(c.variacion_pct)}`}>{textoVariacion(c.variacion_pct)}</span>
            <span className={`num ${claseVariacion(c.vs_promedio_pct)}`}>{textoVariacion(c.vs_promedio_pct)}</span>
          </>
        )
        return c.id_categoria != null && ciclo.id_ciclo ? (
          <Link
            key={c.nombre}
            className="an-cats__fila"
            to={`/movimientos?ciclo=${ciclo.id_ciclo}&categoria=${c.id_categoria}&nombre=${encodeURIComponent(c.nombre)}`}
            title="Ver estos movimientos"
          >
            {fila}
          </Link>
        ) : (
          <div key={c.nombre} className="an-cats__fila">{fila}</div>
        )
      })}
    </div>
  )
}

export function ListaSimple({ filas, vacio }) {
  if (!filas.length) return <p className="empty">{vacio}</p>
  return (
    <ul className="an-lista">
      {filas.map((f, i) => (
        <li key={i}>
          <span className="an-lista__texto">
            {f.titulo}
            {f.detalle && <small>{f.detalle}</small>}
          </span>
          <span className={`num an-lista__valor ${f.clase ?? ''}`}>{f.valor}</span>
        </li>
      ))}
    </ul>
  )
}

export function Mayores({ mayores }) {
  return (
    <ListaSimple
      vacio="Sin gastos en este ciclo."
      filas={mayores.map((m) => ({
        titulo: m.descripcion,
        detalle: [fechaCorta(m.fecha), m.categoria, m.cuenta].filter(Boolean).join(' · '),
        valor: dinero(m.monto),
      }))}
    />
  )
}

export function PorCuenta({ cuentas }) {
  return (
    <ListaSimple
      vacio="Sin gastos en este ciclo."
      filas={cuentas.map((c) => ({
        titulo: c.nombre,
        detalle: c.es_tarjeta ? 'Tarjeta de crédito' : 'Cuenta',
        valor: `${dinero(c.total)} · ${c.porcentaje != null ? c.porcentaje.toFixed(0) : 0}%`,
      }))}
    />
  )
}

export function GraficaBarras({ datos, clave, etiqueta, nombre, color = COLOR.azul, alto = 220 }) {
  return (
    <div className="an-chart" role="img" aria-label={nombre}>
      <ResponsiveContainer width="100%" height={alto}>
        <BarChart data={datos} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#e7e6df" />
          <XAxis dataKey={etiqueta} tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={compacto} tick={{ fontSize: 11 }} width={46} />
          <Tooltip formatter={tooltipDinero} />
          <Bar dataKey={clave} name={nombre} fill={color} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function Recurrentes({ lista }) {
  return (
    <ListaSimple
      vacio="Aún no se detectan gastos que se repitan en varios ciclos."
      filas={lista.map((r) => ({
        titulo: r.descripcion,
        detalle: `${r.categoria} · ${plural(r.ciclos, 'ciclo', 'ciclos')} · último ${dinero(r.ultimo)}`,
        valor: `${dinero(r.por_ciclo)} / ciclo`,
      }))}
    />
  )
}

export function Metas({ metas }) {
  if (!metas.length) return <p className="empty">Todavía no tienes subcuentas con meta.</p>
  return (
    <>
      <ul className="an-metas">
        {metas.map((m) => (
          <li key={m.id_subcuenta}>
            <div className="an-metas__fila">
              <span className="an-lista__texto">
                {m.nombre}
                <small>{m.cuenta}</small>
              </span>
              <span className="num">
                {dinero(m.saldo)} <small>de {dinero(m.meta)}</small>
              </span>
            </div>
            <div className="an-progreso" aria-label={`Avance ${m.porcentaje}%`}>
              <span className={m.alcanzada ? 'is-listo' : ''} style={{ width: `${m.porcentaje}%` }} />
            </div>
            <p className="an-metas__eta">
              {m.alcanzada
                ? 'Meta alcanzada'
                : m.ciclos_restantes != null
                  ? `Faltan ${dinero(m.falta)} · aportando ${dinero(m.aporte_por_ciclo)} por ciclo la alcanzas en ${plural(m.ciclos_restantes, 'ciclo', 'ciclos')}`
                  : m.aportes_libres_sin_historial
                    ? `Faltan ${dinero(m.falta)} · hay aportes tuyos, pero aún no hay historial para estimar su ritmo`
                    : `Faltan ${dinero(m.falta)} · no está en tu plan recurrente ni tiene aportes, así que no se estima cuándo`}
            </p>
            {m.ciclos_restantes != null && (
              <p className="an-metas__eta an-metas__eta--detalle">
                {[
                  m.aporte_plan != null && `${dinero(m.aporte_plan)} del plan «${m.plan}»`,
                  m.aporte_libre != null && `${dinero(m.aporte_libre)} de aportes libres (promedio)`,
                ]
                  .filter(Boolean)
                  .join(' + ')}
              </p>
            )}
          </li>
        ))}
      </ul>
      <p className="an-nota">
        Ritmo por ciclo = lo que aporta tu plan recurrente + el promedio de tus aportes libres (cuando hay al menos 2 ciclos completos de historial). El saldo inicial y los ajustes de saldo no cuentan.
      </p>
    </>
  )
}

export function Deuda({ deuda }) {
  return (
    <>
      {deuda.tarjetas.length === 0 && <p className="empty">No tienes tarjetas de crédito.</p>}
      <ul className="an-metas">
        {deuda.tarjetas.map((t) => (
          <li key={t.id_cuenta}>
            <div className="an-metas__fila">
              <span className="an-lista__texto">
                {t.nombre}
                <small>{t.limite != null ? `Límite ${dinero(t.limite)} · disponible ${dinero(t.disponible)}` : 'Sin límite definido'}</small>
              </span>
              <span className="num">{dinero(t.saldo)}</span>
            </div>
            {t.uso_pct != null && (
              <>
                <div className="an-progreso" aria-label={`Uso ${t.uso_pct}%`}>
                  <span className={t.uso_pct >= 70 ? 'is-alto' : ''} style={{ width: `${Math.min(t.uso_pct, 100)}%` }} />
                </div>
                <p className="an-metas__eta">Usas el {t.uso_pct.toFixed(0)}% de tu límite</p>
              </>
            )}
          </li>
        ))}
      </ul>
      <h3 className="an-sub">Próximas cuotas</h3>
      <ListaSimple
        vacio="No tienes cuotas pendientes."
        filas={deuda.cuotas_proximas.map((q) => ({
          titulo: `${q.descripcion} · cuota ${q.numero_cuota} de ${q.numero_cuotas}`,
          detalle: q.dias_para_vencer < 0 ? `Vencida hace ${plural(-q.dias_para_vencer, 'día', 'días')}` : `Vence ${fechaCorta(q.fecha_vencimiento)} (en ${plural(q.dias_para_vencer, 'día', 'días')})`,
          valor: dinero(q.monto),
          clase: q.dias_para_vencer <= 7 ? 'negative' : '',
        }))}
      />
      {deuda.cuotas_pendientes > 0 && (
        <p className="an-nota">
          En total te faltan {dinero(deuda.financiamiento_restante)} en {plural(deuda.cuotas_pendientes, 'cuota', 'cuotas')}.
        </p>
      )}
    </>
  )
}

export function Obligaciones({ datos }) {
  const hayAlgo = datos.antiguedad.some((a) => a.te_deben || a.debes || a.reposiciones)
  return (
    <>
      <ListaSimple
        vacio="No hay obligaciones pendientes con personas."
        filas={datos.personas.map((p) => ({
          titulo: p.nombre,
          detalle: `La más antigua: ${plural(p.dias_mas_antigua, 'día', 'días')}`,
          valor: `${p.neto > 0 ? '+' : ''}${dinero(p.neto)}`,
          clase: p.neto > 0 ? 'positive' : p.neto < 0 ? 'negative' : '',
        }))}
      />
      {datos.reposiciones.cantidad > 0 && (
        <p className="an-nota">
          Reposiciones pendientes: {plural(datos.reposiciones.cantidad, 'obligación', 'obligaciones')} por {dinero(datos.reposiciones.total)}.
        </p>
      )}
      {hayAlgo && (
        <>
          <h3 className="an-sub">Antigüedad de lo pendiente</h3>
          <div className="an-chart" role="img" aria-label="Antigüedad de lo pendiente">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={datos.antiguedad} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#e7e6df" />
                <XAxis dataKey="rango" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={compacto} tick={{ fontSize: 11 }} width={46} />
                <Tooltip formatter={tooltipDinero} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="te_deben" name="Te deben" stackId="a" fill={COLOR.ingresos} />
                <Bar dataKey="debes" name="Debes" stackId="a" fill={COLOR.gastos} />
                <Bar dataKey="reposiciones" name="Reposiciones" stackId="a" fill={COLOR.ambar} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </>
  )
}
