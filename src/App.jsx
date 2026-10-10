import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import CuentaEditar from './pages/Cuentas/CuentaEditar'
import CuentaNueva from './pages/Cuentas/CuentaNueva'
import Cuentas from './pages/Cuentas/Cuentas'
import SubcuentaPagina from './pages/Cuentas/SubcuentaPagina'
import Movimientos from './pages/Movimientos/Movimientos'
import MovimientoSubcuentaNueva from './pages/Movimientos/MovimientoSubcuentaNueva'
import TransferenciaEditar from './pages/Movimientos/TransferenciaEditar'
import TransferenciaNueva from './pages/Movimientos/TransferenciaNueva'
import Categorias from './pages/Categorias/Categorias'
import CategoriaEditar from './pages/Categorias/CategoriaEditar'
import CategoriaNueva from './pages/Categorias/CategoriaNueva'
import PersonaDetalle from './pages/Personas/PersonaDetalle'
import PersonaEditar from './pages/Personas/PersonaEditar'
import PersonaNueva from './pages/Personas/PersonaNueva'
import Personas from './pages/Personas/Personas'
import PlanDetalle from './pages/Planes/PlanDetalle'
import PlanEditar from './pages/Planes/PlanEditar'
import PlanEjecutar from './pages/Planes/PlanEjecutar'
import PlanNuevo from './pages/Planes/PlanNuevo'
import Planes from './pages/Planes/Planes'
import CuotaEditar from './pages/Financiamientos/CuotaEditar'
import CuotaNueva from './pages/Financiamientos/CuotaNueva'
import CuotaPagar from './pages/Financiamientos/CuotaPagar'
import FinanciamientoEditar from './pages/Financiamientos/FinanciamientoEditar'
import FinanciamientoNuevo from './pages/Financiamientos/FinanciamientoNuevo'
import Financiamientos from './pages/Financiamientos/Financiamientos'
import ObligacionEditar from './pages/Obligaciones/ObligacionEditar'
import LiquidarVarias from './pages/Obligaciones/LiquidarVarias'
import ObligacionLiquidar from './pages/Obligaciones/ObligacionLiquidar'
import ObligacionNueva from './pages/Obligaciones/ObligacionNueva'
import Obligaciones from './pages/Obligaciones/Obligaciones'
import Pendiente from './pages/Pendiente'
import Resumen from './pages/Resumen/Resumen'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Resumen />} />
        <Route path="cuentas" element={<Cuentas />} />
        <Route path="cuentas/nueva" element={<CuentaNueva />} />
        <Route path="cuentas/:idCuenta/editar" element={<CuentaEditar />} />
        <Route path="cuentas/:idCuenta/subcuentas/nueva" element={<SubcuentaPagina />} />
        <Route path="cuentas/:idCuenta/subcuentas/:idSubcuenta/editar" element={<SubcuentaPagina />} />
        <Route path="movimientos" element={<Movimientos />} />
        <Route path="movimientos/subcuentas/nueva" element={<MovimientoSubcuentaNueva />} />
        <Route path="transferencias/nueva" element={<TransferenciaNueva />} />
        <Route path="transferencias/:idTransaccion/editar" element={<TransferenciaEditar />} />
        <Route path="personas" element={<Personas />} />
        <Route path="personas/nueva" element={<PersonaNueva />} />
        <Route path="personas/:idPersona" element={<PersonaDetalle />} />
        <Route path="personas/:idPersona/editar" element={<PersonaEditar />} />
        <Route path="categorias" element={<Categorias />} />
        <Route path="categorias/nueva" element={<CategoriaNueva />} />
        <Route path="categorias/:idCategoria/editar" element={<CategoriaEditar />} />
        <Route path="planes-recurrentes" element={<Planes />} />
        <Route path="planes-recurrentes/nuevo" element={<PlanNuevo />} />
        <Route path="planes-recurrentes/:idPlan" element={<PlanDetalle />} />
        <Route path="planes-recurrentes/:idPlan/editar" element={<PlanEditar />} />
        <Route path="planes-recurrentes/:idPlan/ejecutar" element={<PlanEjecutar />} />
        <Route path="obligaciones" element={<Obligaciones />} />
        <Route path="obligaciones/nueva" element={<ObligacionNueva />} />
        <Route path="obligaciones/liquidar-varias" element={<LiquidarVarias />} />
        <Route path="obligaciones/:idObligacion/editar" element={<ObligacionEditar />} />
        <Route path="obligaciones/:idObligacion/liquidar" element={<ObligacionLiquidar />} />
        <Route path="financiamientos" element={<Financiamientos />} />
        <Route path="financiamientos/nuevo" element={<FinanciamientoNuevo />} />
        <Route path="financiamientos/:idFinanciamiento/editar" element={<FinanciamientoEditar />} />
        <Route path="financiamientos/:idFinanciamiento/cuotas/nueva" element={<CuotaNueva />} />
        <Route path="cuotas-financiamiento/:idCuota/editar" element={<CuotaEditar />} />
        <Route path="cuotas-financiamiento/:idCuota/pagar" element={<CuotaPagar />} />
        <Route path="*" element={<Pendiente />} />
      </Route>
    </Routes>
  )
}
