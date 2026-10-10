import { useNavigate, useParams } from 'react-router-dom'
import { actualizarConfigCiclos, crearConfigCiclos, getConfigsCiclos } from '../../api/ciclos'
import ConfirmDialog from '../../components/ConfirmDialog'
import ErrorCarga from '../../components/ErrorCarga'
import { EncabezadoFormulario, PaginaFormulario, VolverA } from '../../components/forms'
import { useConfirmarEliminacion } from '../../hooks/useConfirmarEliminacion'
import { useRecurso } from '../../hooks/useRecurso'
import CicloConfigForm from './CicloConfigForm'
import { eliminarConfigConfig } from './eliminaciones'
import './ciclos.css'

export function CicloConfigNueva() {
  const navigate = useNavigate()
  const guardar = async (cuerpo) => {
    await crearConfigCiclos(cuerpo)
    navigate('/ciclos', { state: { aviso: 'Configuración creada.' } })
  }
  return (
    <PaginaFormulario>
      <VolverA to="/ciclos">Ciclos</VolverA>
      <EncabezadoFormulario titulo="Nueva configuración" subtitulo="Define cada cuánto empieza un nuevo ciclo." />
      <CicloConfigForm onGuardar={guardar} />
    </PaginaFormulario>
  )
}

export function CicloConfigEditar() {
  const { idConfig } = useParams()
  const navigate = useNavigate()
  const { data, error, loading, recargar } = useRecurso(getConfigsCiclos)
  const { pedir, dialogoProps } = useConfirmarEliminacion()
  const config = data?.find((c) => String(c.id_ciclo_config) === idConfig)

  const guardar = async (cuerpo) => {
    await actualizarConfigCiclos(idConfig, cuerpo)
    navigate('/ciclos', { state: { aviso: 'Cambios guardados.' } })
  }

  return (
    <PaginaFormulario>
      <VolverA to="/ciclos">Ciclos</VolverA>
      <EncabezadoFormulario titulo="Editar configuración" subtitulo={config?.nombre ?? ' '} />
      {loading && !data && <div className="skeleton" style={{ height: 360 }} />}
      {error && <ErrorCarga titulo="No se pudo cargar la configuración" error={error} onReintentar={recargar} />}
      {data && !config && <p className="form-error">Esa configuración no existe.</p>}
      {config && (
        <CicloConfigForm
          config={config}
          onGuardar={guardar}
          onEliminar={() =>
            pedir(eliminarConfigConfig(config, () => navigate('/ciclos', { state: { aviso: 'Configuración eliminada.' } })))
          }
        />
      )}
      <ConfirmDialog {...dialogoProps} />
    </PaginaFormulario>
  )
}
