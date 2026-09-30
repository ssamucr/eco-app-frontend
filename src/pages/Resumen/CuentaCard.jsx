import Icon from '../../components/Icon'
import UsoTarjeta from '../../components/UsoTarjeta'
import { TARJETA, colorSubcuenta, COLOR_SIN_ASIGNAR, etiquetaTipo } from '../../lib/cuentas'
import { dinero } from '../../lib/format'

const COLOR_OTRAS = '#c9c9c4'

function colorSegmento(segmento, indice) {
  if (segmento.tipo === 'otras') return COLOR_OTRAS
  if (segmento.tipo === 'sin_asignar') return COLOR_SIN_ASIGNAR
  return colorSubcuenta(indice)
}

function Subcuentas({ segmentos }) {
  return (
    <>
      <div className="account__divider" />
      <p className="account__eyebrow">Subcuentas</p>
      <div className="segments segments--thin">
        {segmentos.map((s, i) => (
          <div key={s.nombre} style={{ flex: `${s.porcentaje} 0 0`, background: colorSegmento(s, i) }} />
        ))}
      </div>
      <div className="legend">
        {segmentos.map((s, i) => (
          <div key={s.nombre} className="legend__item">
            <span className="dot" style={{ background: colorSegmento(s, i) }} />
            <span>{s.nombre}</span>
            <span className="legend__amount num">{dinero(s.saldo)}</span>
          </div>
        ))}
      </div>
    </>
  )
}

export default function CuentaCard({ cuenta }) {
  const esTarjeta = cuenta.tipo === TARJETA
  return (
    <div className="card">
      <div className="account__head">
        <div className="account__id">
          <div className={`tile ${esTarjeta ? 'tile--neutral' : ''}`}>
            <Icon nombre={esTarjeta ? 'tarjeta' : 'cartera'} size={19} strokeWidth={1.6} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p className="account__name">{cuenta.nombre}</p>
            {cuenta.entidad && <p className="account__entity">{cuenta.entidad}</p>}
          </div>
        </div>
        <div className="account__balance">
          <span className="chip">{etiquetaTipo(cuenta.tipo)}</span>
          <p className={`account__amount num ${!esTarjeta && cuenta.saldo < 0 ? 'negative' : ''}`}>
            {dinero(cuenta.saldo)}
          </p>
        </div>
      </div>
      {esTarjeta ? <UsoTarjeta cuenta={cuenta} /> : cuenta.subcuentas && <Subcuentas segmentos={cuenta.subcuentas} />}
    </div>
  )
}
