import { dinero, dineroConSigno } from '../../lib/format'

function Triangulo({ hacia }) {
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
      <path d={hacia === 'arriba' ? 'M5 1l4 5H1z' : 'M5 9L1 4h8z'} />
    </svg>
  )
}

// `invertir`: en la deuda, que baje es lo bueno.
function Tendencia({ pct, invertir = false }) {
  if (pct == null) {
    return <div className="kpi__trend kpi__trend--neutral">Sin datos del inicio del ciclo</div>
  }
  const sube = pct > 0
  const bueno = invertir ? !sube : sube
  const clase = pct === 0 ? 'kpi__trend--neutral' : bueno ? 'positive' : 'negative'
  return (
    <div className={`kpi__trend ${clase}`}>
      {pct !== 0 && <Triangulo hacia={sube ? 'arriba' : 'abajo'} />}
      <span>{Math.abs(pct).toFixed(1)}% desde el inicio del ciclo</span>
    </div>
  )
}

function Kpi({ etiqueta, children }) {
  return (
    <div className="card">
      <p className="kpi__label">{etiqueta}</p>
      {children}
    </div>
  )
}

export default function KpiRow({ kpis, obligaciones, cierre = false }) {
  const { ahorro, deuda_tarjetas: deuda, patrimonio_neto: patrimonio } = kpis
  const balance = obligaciones.balance

  return (
    <div className="kpi-row">
      <Kpi etiqueta={cierre ? 'Saldo en ahorro al cierre del ciclo' : 'Saldo en cuentas de ahorro'}>
        <p className="kpi__value">{dinero(ahorro.total)}</p>
        <Tendencia pct={ahorro.variacion_pct} />
      </Kpi>

      <Kpi etiqueta={cierre ? 'Deuda en tarjetas al cierre' : 'Deuda en tarjetas de crédito'}>
        <p className="kpi__value">{dinero(deuda.total)}</p>
        <Tendencia pct={deuda.variacion_pct} invertir />
        {deuda.total < 0 && <p className="kpi__note">Saldo a favor en tarjetas</p>}
      </Kpi>

      <Kpi etiqueta={cierre ? 'Patrimonio neto al cierre' : 'Patrimonio neto'}>
        <p className="kpi__value">{dinero(patrimonio.total)}</p>
        <Tendencia pct={patrimonio.variacion_pct} />
      </Kpi>

      <Kpi etiqueta="Balance de obligaciones">
        <p className={`kpi__value ${balance > 0 ? 'positive' : balance < 0 ? 'negative' : ''}`}>
          {dineroConSigno(balance)}
        </p>
        <p className="kpi__note">
          Te deben {dinero(obligaciones.por_cobrar)} · Debes {dinero(obligaciones.por_pagar)}
        </p>
      </Kpi>
    </div>
  )
}
