import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getCuentasDetalle } from '../../api/cuentas'
import Aviso from '../../components/Aviso'
import ConfirmDialog from '../../components/ConfirmDialog'
import ErrorCarga from '../../components/ErrorCarga'
import Icon from '../../components/Icon'
import { useConfirmarEliminacion } from '../../hooks/useConfirmarEliminacion'
import { useRecurso } from '../../hooks/useRecurso'
import { dinero, plural } from '../../lib/format'
import CuentaItem from './CuentaItem'
import { eliminarCuentaConfig, eliminarSubcuentaConfig } from './eliminaciones'
import './cuentas.css'

function Grupo({ titulo, total, vacio, children }) {
  return (
    <section className="group">
      <div className="group__head">
        <h2 className="group__title">{titulo}</h2>
        <span className="group__total">Total: {dinero(total)}</span>
      </div>
      {children.length === 0 ? <p className="empty">{vacio}</p> : children}
    </section>
  )
}

function Cargando() {
  return (
    <>
      <div className="skeleton" style={{ height: 220 }} />
      <div className="skeleton" style={{ height: 120 }} />
      <div className="skeleton" style={{ height: 120 }} />
    </>
  )
}

export default function Cuentas() {
  const { data, error, loading, recargar } = useRecurso(getCuentasDetalle)
  const location = useLocation()
  const navigate = useNavigate()
  const { pedir, dialogoProps } = useConfirmarEliminacion()

  const [aviso, setAviso] = useState(location.state?.aviso ?? null)

  // El aviso llega por el estado de navegación: se limpia para que no reaparezca al recargar.
  useEffect(() => {
    if (location.state?.aviso) navigate(location.pathname, { replace: true, state: null })
  }, [location, navigate])

  const eliminarCuenta = (cuenta) =>
    pedir(
      eliminarCuentaConfig(cuenta, () => {
        setAviso('Cuenta eliminada.')
        recargar()
      }),
    )
  const eliminarSubcuenta = (subcuenta) =>
    pedir(
      eliminarSubcuentaConfig(subcuenta, () => {
        setAviso('Subcuenta eliminada.')
        recargar()
      }),
    )

  const ahorro = data?.ahorro.cuentas ?? []
  const tarjetas = data?.tarjetas.cuentas ?? []

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Cuentas</h1>
          <p className="page-subtitle">
            {data
              ? `${plural(ahorro.length, 'cuenta de ahorro', 'cuentas de ahorro')} · ${plural(tarjetas.length, 'tarjeta de crédito', 'tarjetas de crédito')}`
              : ' '}
          </p>
        </div>
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
      </div>

      <div className="page-toolbar">
        <Link to="/cuentas/nueva" className="quickbtn quickbtn--primary quickbtn--lg">
          <Icon nombre="agregar" size={15} strokeWidth={2} />
          Nueva cuenta
        </Link>
      </div>

      <Aviso mensaje={aviso} onCerrar={() => setAviso(null)} />

      {loading && !data && <Cargando />}
      {error && <ErrorCarga titulo="No se pudieron cargar las cuentas" error={error} onReintentar={recargar} />}

      {data && (
        <>
          <Grupo titulo="Cuentas de ahorro" total={data.ahorro.total} vacio="Todavía no tienes cuentas de ahorro.">
            {ahorro.map((cuenta) => (
              <CuentaItem
                key={cuenta.id_cuenta}
                cuenta={cuenta}
                onEliminarCuenta={eliminarCuenta}
                onEliminarSubcuenta={eliminarSubcuenta}
              />
            ))}
          </Grupo>

          <Grupo titulo="Tarjetas de crédito" total={data.tarjetas.total} vacio="Todavía no tienes tarjetas de crédito.">
            {tarjetas.map((cuenta) => (
              <CuentaItem key={cuenta.id_cuenta} cuenta={cuenta} onEliminarCuenta={eliminarCuenta} />
            ))}
          </Grupo>
        </>
      )}

      <ConfirmDialog {...dialogoProps} />
    </>
  )
}
