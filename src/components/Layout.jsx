import { Outlet, useLocation } from 'react-router-dom'
import NavMovil from './NavMovil'
import Sidebar from './Sidebar'
import './Layout.css'

// Pantallas de captura (nuevo, editar, liquidar...): en celular se oculta la barra inferior para dar espacio al formulario.
const ES_FORMULARIO = /\/(nuev[oa]|editar|ejecutar|liquidar|liquidar-varias|pagar)(\/|$)/

export default function Layout() {
  const { pathname } = useLocation()
  return (
    <div className="layout" data-formulario={ES_FORMULARIO.test(pathname) || undefined}>
      <Sidebar />
      <main className="content">
        <div className="content__inner">
          <Outlet />
        </div>
      </main>
      <NavMovil />
    </div>
  )
}
