import { dinero, porcentaje } from '../lib/format'

// La deuda de una tarjeta es su saldo: si es negativo, hay saldo a favor.
export default function UsoTarjeta({ cuenta }) {
  if (cuenta.limite_credito == null) return null
  const aFavor = cuenta.saldo < 0
  const uso = Math.min(Math.max(cuenta.uso_pct ?? 0, 0), 100)
  return (
    <>
      <div className="usage__meta">
        <span>
          {aFavor
            ? `Saldo a favor ${dinero(-cuenta.saldo)} · Límite ${dinero(cuenta.limite_credito)}`
            : `Disponible ${dinero(cuenta.disponible)} de ${dinero(cuenta.limite_credito)}`}
        </span>
        <span>{porcentaje(uso)}</span>
      </div>
      <div className="usage__track">
        <div className="usage__fill" style={{ width: `${uso}%` }} />
      </div>
    </>
  )
}
