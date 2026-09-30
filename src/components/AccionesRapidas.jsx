import { Link } from 'react-router-dom'
import Icon from './Icon'

// Los tres botones de la cabecera de cada pantalla.
export default function AccionesRapidas() {
  return (
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
  )
}
