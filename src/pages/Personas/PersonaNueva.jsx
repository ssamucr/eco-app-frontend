import { useNavigate } from 'react-router-dom'
import { crearPersona } from '../../api/personas'
import { EncabezadoFormulario, PaginaFormulario, VolverA } from '../../components/forms'
import PersonaForm from './PersonaForm'
import './personas.css'

export default function PersonaNueva() {
  const navigate = useNavigate()

  const guardar = async (cuerpo) => {
    await crearPersona(cuerpo)
    navigate('/personas', { state: { aviso: 'Persona creada.' } })
  }

  return (
    <PaginaFormulario>
      <VolverA to="/personas">Personas</VolverA>
      <EncabezadoFormulario titulo="Nueva persona" subtitulo="Agrégala para registrar obligaciones con ella." />
      <PersonaForm onGuardar={guardar} />
    </PaginaFormulario>
  )
}
