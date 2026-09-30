import Icon from './Icon'
import './Aviso.css'

export default function Aviso({ mensaje, onCerrar }) {
  if (!mensaje) return null
  return (
    <div className="aviso" role="status">
      <span>{mensaje}</span>
      <button type="button" className="aviso__close" aria-label="Cerrar aviso" onClick={onCerrar}>
        <Icon nombre="cerrar" size={14} strokeWidth={2} />
      </button>
    </div>
  )
}
