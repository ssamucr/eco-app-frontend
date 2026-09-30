import { useNavigate, useSearchParams } from 'react-router-dom'
import { crearObligacion, getOpcionesObligacion } from '../../api/obligaciones'
import ErrorCarga from '../../components/ErrorCarga'
import { EncabezadoFormulario, PaginaFormulario, VolverA } from '../../components/forms'
import { useRecurso } from '../../hooks/useRecurso'
import ObligacionForm from './ObligacionForm'
import './obligaciones.css'

export default function ObligacionNueva() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { data: opciones, error, loading, recargar } = useRecurso(getOpcionesObligacion)

  const guardar = async (cuerpo) => {
    await crearObligacion(cuerpo)
    navigate('/obligaciones', { state: { aviso: 'Obligación creada.' } })
  }

  return (
    <PaginaFormulario>
      <VolverA to="/obligaciones">Obligaciones</VolverA>
      <EncabezadoFormulario titulo="Nueva obligación" subtitulo="Registra una deuda por cobrar o por pagar con una persona." />
      {loading && !opciones && <div className="skeleton" style={{ height: 520 }} />}
      {error && <ErrorCarga titulo="No se pudieron cargar los datos" error={error} onReintentar={recargar} />}
      {opciones && <ObligacionForm opciones={opciones} personaInicial={params.get('persona')} onGuardar={guardar} />}
    </PaginaFormulario>
  )
}
