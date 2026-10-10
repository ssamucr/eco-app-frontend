import { dinero, dineroConSigno, rangoFechas } from '../../lib/format'

function Triangulo({ hacia }) {
  return (
    <svg width="9" height="9" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
      <path d={hacia === 'arriba' ? 'M5 1l4 5H1z' : 'M5 9L1 4h8z'} />
    </svg>
  )
}

// `invertir`: en los gastos, que bajen es lo bueno. Compara el total del ciclo con el del ciclo anterior completo.
function Comparacion({ pct, invertir = false, anterior, comparacion, vacio }) {
  if (pct == null) {
    return (
      <div className="kpi__trend kpi__trend--neutral">
        {anterior == null ? 'Sin ciclo anterior' : vacio}
      </div>
    )
  }
  const sube = pct > 0
  const bueno = invertir ? !sube : sube
  const clase = pct === 0 ? 'kpi__trend--neutral' : bueno ? 'positive' : 'negative'
  return (
    <div
      className={`kpi__trend ${clase}`}
      title={comparacion ? `Ciclo anterior: ${rangoFechas(comparacion.desde, comparacion.hasta)} · ${dinero(anterior)}` : undefined}
    >
      {pct !== 0 && <Triangulo hacia={sube ? 'arriba' : 'abajo'} />}
      <span>{Math.abs(pct).toFixed(1)}% vs. ciclo anterior</span>
    </div>
  )
}

// Ingresos, gastos y balance del ciclo mostrado.
export default function PeriodoRow({ periodo }) {
  const { ingresos, gastos, balance, comparacion } = periodo
  return (
    <div className="kpi-row kpi-row--tres">
      <div className="card">
        <p className="kpi__label">Ingresos del ciclo</p>
        <p className="kpi__value positive">{dinero(ingresos.total)}</p>
        <Comparacion pct={ingresos.variacion_pct} anterior={ingresos.anterior_total} comparacion={comparacion} vacio="Sin ingresos en el ciclo anterior" />
      </div>
      <div className="card">
        <p className="kpi__label">Gastos del ciclo</p>
        <p className="kpi__value">{dinero(gastos.total)}</p>
        <Comparacion pct={gastos.variacion_pct} invertir anterior={gastos.anterior_total} comparacion={comparacion} vacio="Sin gastos en el ciclo anterior" />
      </div>
      <div className="card">
        <p className="kpi__label">Balance del ciclo</p>
        <p className={`kpi__value ${balance > 0 ? 'positive' : balance < 0 ? 'negative' : ''}`}>{dineroConSigno(balance)}</p>
        <p className="kpi__note">Ingresos menos gastos</p>
      </div>
    </div>
  )
}
