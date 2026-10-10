import { dinero, porcentaje, rangoFechas } from '../../lib/format'

const COLORES = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4']
const COLOR_OTROS = '#c3c2b7'

// "Otros" (sin id) siempre va al final y en gris.
const colorDe = (categoria, indice) => (categoria.id_categoria == null ? COLOR_OTROS : COLORES[indice] ?? COLOR_OTROS)

export default function GastosPorCategoria({ gastos, ciclo }) {
  const { categorias } = gastos
  return (
    <div className="card">
      <div className="spend__head">
        <div>
          <h2 className="section-title">Gastos por categoría</h2>
          <p className="spend__month">{rangoFechas(gastos.desde, gastos.hasta)}</p>
        </div>
        <p className="spend__total num">{dinero(gastos.total)}</p>
      </div>

      {categorias.length === 0 ? (
        <p className="empty" style={{ marginTop: 16 }}>
          Sin gastos en este ciclo.
        </p>
      ) : (
        <>
          <div className="segments segments--thick">
            {categorias.map((c, i) => (
              <div key={c.nombre} style={{ flex: `${c.porcentaje} 0 0`, background: colorDe(c, i) }} />
            ))}
          </div>
          <div className="spend__list">
            {categorias.map((c, i) => (
              <div key={c.nombre} className="spend__row">
                <span className="dot" style={{ background: colorDe(c, i) }} />
                <span className="spend__name">{c.nombre}</span>
                <span className="spend__amount num">{dinero(c.total)}</span>
                <span className="spend__pct num">{porcentaje(c.porcentaje)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
