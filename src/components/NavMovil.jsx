import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useSesion } from '../hooks/useSesion'
import { AUTH_ACTIVA, cerrarSesion } from '../lib/sesion'
import HojaInferior from './HojaInferior'
import Icon from './Icon'

// En el celular reemplaza a la barra lateral: pestañas abajo, un "+" central para registrar y un menu "Más".
const NUEVO = [
  { to: '/transferencias/nueva?tipo=GASTO', icono: 'menos', titulo: 'Gasto', detalle: 'Una compra o un pago' },
  { to: '/transferencias/nueva?tipo=INGRESO', icono: 'mas', titulo: 'Ingreso', detalle: 'Dinero que entra a una cuenta' },
  { to: '/transferencias/nueva', icono: 'transferencia', titulo: 'Transferencia', detalle: 'Entre tus cuentas' },
  { to: '/transferencias/nueva?tipo=PAGO_TARJETA', icono: 'tarjeta', titulo: 'Pago a tarjeta', detalle: 'Abonar a una tarjeta de crédito' },
  { to: '/obligaciones/nueva', icono: 'obligaciones', titulo: 'Obligación', detalle: 'Alguien te debe o tú debes' },
  { to: '/movimientos/subcuentas/nueva', icono: 'ahorro', titulo: 'Movimiento de subcuenta', detalle: 'Mover dinero dentro de una cuenta' },
]

const MAS = [
  { to: '/analitica', icono: 'grafica', titulo: 'Analítica' },
  { to: '/obligaciones', icono: 'obligaciones', titulo: 'Obligaciones' },
  { to: '/personas', icono: 'personas', titulo: 'Personas' },
  { to: '/financiamientos', icono: 'tarjeta', titulo: 'Financiamientos' },
  { to: '/planes-recurrentes', icono: 'recurrente', titulo: 'Planes recurrentes' },
  { to: '/categorias', icono: 'categorias', titulo: 'Categorías' },
  { to: '/ciclos', icono: 'calendario', titulo: 'Ciclos' },
]

const enRuta = (ruta, base) => ruta === base || ruta.startsWith(`${base}/`)

export default function NavMovil() {
  const [hoja, setHoja] = useState(null) // 'nuevo' | 'mas' | null
  const { pathname } = useLocation()
  const sesion = useSesion()

  // al navegar (o al volver atras) se cierra la hoja
  useEffect(() => setHoja(null), [pathname])

  const masActivo = MAS.some((m) => enRuta(pathname, m.to))
  const cerrar = () => setHoja(null)

  return (
    <>
      <nav className="navmovil" aria-label="Navegación principal">
        <NavLink to="/" end className="navmovil__tab">
          <Icon nombre="resumen" size={22} />
          <span>Resumen</span>
        </NavLink>
        <NavLink to="/cuentas" className="navmovil__tab">
          <Icon nombre="cuentas" size={22} />
          <span>Cuentas</span>
        </NavLink>
        <div className="navmovil__centro">
          <button type="button" className="navmovil__nuevo" aria-label="Registrar un movimiento" aria-haspopup="dialog" onClick={() => setHoja('nuevo')}>
            <Icon nombre="suma" size={26} strokeWidth={2.2} />
          </button>
        </div>
        <NavLink to="/movimientos" className="navmovil__tab">
          <Icon nombre="transferencia" size={22} />
          <span>Movimientos</span>
        </NavLink>
        <button type="button" className={`navmovil__tab ${masActivo || hoja === 'mas' ? 'active' : ''}`} aria-haspopup="dialog" onClick={() => setHoja('mas')}>
          <Icon nombre="puntos" size={22} />
          <span>Más</span>
        </button>
      </nav>

      <HojaInferior abierta={hoja === 'nuevo'} onCerrar={cerrar} titulo="¿Qué quieres registrar?">
        <ul className="hoja__lista">
          {NUEVO.map(({ to, icono, titulo, detalle }) => (
            <li key={titulo}>
              <Link to={to} className="hoja__fila">
                <span className="hoja__icono">
                  <Icon nombre={icono} size={20} />
                </span>
                <span className="hoja__texto">
                  <strong>{titulo}</strong>
                  <small>{detalle}</small>
                </span>
                <Icon nombre="siguiente" size={16} />
              </Link>
            </li>
          ))}
        </ul>
      </HojaInferior>

      <HojaInferior abierta={hoja === 'mas'} onCerrar={cerrar} titulo="Más">
        <ul className="hoja__lista">
          {MAS.map(({ to, icono, titulo }) => (
            <li key={to}>
              <Link to={to} className={`hoja__fila ${enRuta(pathname, to) ? 'es-actual' : ''}`}>
                <span className="hoja__icono">
                  <Icon nombre={icono} size={20} />
                </span>
                <span className="hoja__texto">
                  <strong>{titulo}</strong>
                </span>
                <Icon nombre="siguiente" size={16} />
              </Link>
            </li>
          ))}
        </ul>
        {AUTH_ACTIVA && sesion && (
          <div className="hoja__sesion">
            <span className="hoja__correo">{sesion.email}</span>
            <button type="button" className="btn hoja__salir" onClick={cerrarSesion}>
              <Icon nombre="salir" size={16} />
              Cerrar sesión
            </button>
          </div>
        )}
      </HojaInferior>
    </>
  )
}
