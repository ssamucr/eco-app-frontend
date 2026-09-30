import { useNavigate, useParams } from 'react-router-dom'
import { actualizarCuenta, getCuentaDetalle } from '../../api/cuentas'
import Aviso from '../../components/Aviso'
import ConfirmDialog from '../../components/ConfirmDialog'
import ErrorCarga from '../../components/ErrorCarga'
import { EncabezadoFormulario, PaginaFormulario, VolverA } from '../../components/forms'
import { useConfirmarEliminacion } from '../../hooks/useConfirmarEliminacion'
import { useRecurso } from '../../hooks/useRecurso'
import { useState } from 'react'
import CuentaForm from './CuentaForm'
import { eliminarCuentaConfig, eliminarSubcuentaConfig } from './eliminaciones'
import './cuentas.css'

export default function CuentaEditar() {
  const { idCuenta } = useParams()
  const navigate = useNavigate()
  const { data: cuenta, error, loading, recargar } = useRecurso(
    (opciones) => getCuentaDetalle(idCuenta, opciones),
    [idCuenta],
  )
  const { pedir, dialogoProps } = useConfirmarEliminacion()
  const [aviso, setAviso] = useState(null)

  const guardar = async (cuerpo) => {
    await actualizarCuenta(idCuenta, cuerpo)
    navigate('/cuentas', { state: { aviso: 'Cambios guardados.' } })
  }

  return (
    <PaginaFormulario>
      <VolverA to="/cuentas">Cuentas</VolverA>
      <EncabezadoFormulario
        titulo="Editar cuenta"
        subtitulo={cuenta ? [cuenta.nombre, cuenta.entidad].filter(Boolean).join(' · ') : ' '}
      />

      <Aviso mensaje={aviso} onCerrar={() => setAviso(null)} />
      {loading && !cuenta && <div className="skeleton" style={{ height: 420 }} />}
      {error && <ErrorCarga titulo="No se pudo cargar la cuenta" error={error} onReintentar={recargar} />}

      {cuenta && (
        <CuentaForm
          cuenta={cuenta}
          onGuardar={guardar}
          onEliminar={() =>
            pedir(eliminarCuentaConfig(cuenta, () => navigate('/cuentas', { state: { aviso: 'Cuenta eliminada.' } })))
          }
          onEliminarSubcuenta={(sub) =>
            pedir(
              eliminarSubcuentaConfig(sub, () => {
                setAviso('Subcuenta eliminada.')
                recargar()
              }),
            )
          }
        />
      )}

      <ConfirmDialog {...dialogoProps} />
    </PaginaFormulario>
  )
}
