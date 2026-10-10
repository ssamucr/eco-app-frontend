import { NavLink } from 'react-router-dom'
import Icon from './Icon'

const ENLACES = [
  { to: '/', etiqueta: 'Resumen', icono: 'resumen', end: true },
  { to: '/cuentas', etiqueta: 'Cuentas', icono: 'cuentas' },
  { to: '/movimientos', etiqueta: 'Movimientos', icono: 'transferencia' },
  { to: '/personas', etiqueta: 'Personas', icono: 'personas' },
  { to: '/categorias', etiqueta: 'Categorías', icono: 'categorias' },
  { to: '/planes-recurrentes', etiqueta: 'Planes recurrentes', icono: 'recurrente' },
  { to: '/obligaciones', etiqueta: 'Obligaciones', icono: 'obligaciones' },
  { to: '/financiamientos', etiqueta: 'Financiamientos', icono: 'tarjeta' },
  { to: '/analitica', etiqueta: 'Analítica', icono: 'grafica' },
  { to: '/ciclos', etiqueta: 'Ciclos', icono: 'calendario' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo">E</div>
        <span className="sidebar__name">Eco</span>
      </div>
      <nav className="sidebar__nav">
        {ENLACES.map(({ to, etiqueta, icono, end }) => (
          <NavLink key={to} to={to} end={end} className="navlink">
            <Icon nombre={icono} />
            <span>{etiqueta}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
