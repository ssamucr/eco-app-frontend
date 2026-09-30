import { useNavigate, useParams } from 'react-router-dom'
import { actualizarSubcuenta, crearSubcuenta, getCuentaDetalle } from '../../api/cuentas'
import ConfirmDialog from '../../components/ConfirmDialog'
import ErrorCarga from '../../components/ErrorCarga'
import { EncabezadoFormulario, PaginaFormulario, VolverA } from '../../components/forms'
import { useConfirmarEliminacion } from '../../hooks/useConfirmarEliminacion'
import { useRecurso } from '../../hooks/useRecurso'
import { TARJETA } from '../../lib/cuentas'
import { eliminarSubcuentaConfig } from './eliminaciones'
import SubcuentaForm from './SubcuentaForm'
import './cuentas.css'

// Pantalla de alta (sin idSubcuenta en la ruta) y de edición de una subcuenta.
export default function SubcuentaPagina() {
  const { idCuenta, idSubcuenta } = useParams()
  const editando = idSubcuenta !== undefined
  const navigate = useNavigate()
  const { data: cuenta, error, loading, recargar } = useRecurso(
    (opciones) => getCuentaDetalle(idCuenta, opciones),
    [idCuenta],
  )
  const { pedir, dialogoProps } = useConfirmarEliminacion()

  const subcuenta = cuenta?.subcuentas.find((s) => String(s.id_subcuenta) === idSubcuenta) ?? null
  const esTarjeta = cuenta?.tipo === TARJETA

  const guardar = async (cuerpo) => {
    if (editando) await actualizarSubcuenta(idSubcuenta, cuerpo)
    else await crearSubcuenta(cuerpo)
    navigate('/cuentas', { state: { aviso: editando ? 'Cambios guardados.' : 'Subcuenta creada.' } })
  }

  const titulo = editando ? 'Editar subcuenta' : 'Nueva subcuenta'
  let contenido = null
  if (cuenta && esTarjeta) {
    contenido = (
      <p className="form-error" role="alert">
        Las tarjetas de crédito no admiten subcuentas.
      </p>
    )
  } else if (cuenta && editando && !subcuenta) {
    contenido = (
      <p className="form-error" role="alert">
        La subcuenta no existe.
      </p>
    )
  } else if (cuenta) {
    contenido = (
      <SubcuentaForm
        cuenta={cuenta}
        subcuenta={subcuenta}
        onGuardar={guardar}
        onEliminar={() =>
          pedir(
            eliminarSubcuentaConfig(subcuenta, () =>
              navigate('/cuentas', { state: { aviso: 'Subcuenta eliminada.' } }),
            ),
          )
        }
      />
    )
  }

  return (
    <PaginaFormulario>
      <VolverA to="/cuentas">Cuentas</VolverA>
      <EncabezadoFormulario
        titulo={titulo}
        subtitulo={cuenta ? `En ${[cuenta.nombre, cuenta.entidad].filter(Boolean).join(' · ')}` : ' '}
      />
      {loading && !cuenta && <div className="skeleton" style={{ height: 420 }} />}
      {error && <ErrorCarga titulo="No se pudo cargar la cuenta" error={error} onReintentar={recargar} />}
      {contenido}
      <ConfirmDialog {...dialogoProps} />
    </PaginaFormulario>
  )
}
