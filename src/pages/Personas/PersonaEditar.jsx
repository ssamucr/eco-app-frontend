import { useNavigate, useParams } from 'react-router-dom'
import { actualizarPersona, getPersonaDetalle } from '../../api/personas'
import ConfirmDialog from '../../components/ConfirmDialog'
import ErrorCarga from '../../components/ErrorCarga'
import { EncabezadoFormulario, PaginaFormulario, VolverA } from '../../components/forms'
import { useConfirmarEliminacion } from '../../hooks/useConfirmarEliminacion'
import { useRecurso } from '../../hooks/useRecurso'
import { eliminarPersonaConfig } from './eliminaciones'
import PersonaForm from './PersonaForm'
import './personas.css'

export default function PersonaEditar() {
  const { idPersona } = useParams()
  const navigate = useNavigate()
  const { data: persona, error, loading, recargar } = useRecurso((o) => getPersonaDetalle(idPersona, o), [idPersona])
  const { pedir, dialogoProps } = useConfirmarEliminacion()

  const guardar = async (cuerpo) => {
    await actualizarPersona(idPersona, cuerpo)
    navigate('/personas', { state: { aviso: 'Cambios guardados.' } })
  }

  return (
    <PaginaFormulario>
      <VolverA to="/personas">Personas</VolverA>
      <EncabezadoFormulario titulo="Editar persona" subtitulo={persona?.nombre ?? ' '} />
      {loading && !persona && <div className="skeleton" style={{ height: 280 }} />}
      {error && <ErrorCarga titulo="No se pudo cargar la persona" error={error} onReintentar={recargar} />}
      {persona && (
        <PersonaForm
          persona={persona}
          onGuardar={guardar}
          onEliminar={() =>
            pedir(eliminarPersonaConfig(persona, () => navigate('/personas', { state: { aviso: 'Persona eliminada.' } })))
          }
        />
      )}
      <ConfirmDialog {...dialogoProps} />
    </PaginaFormulario>
  )
}
