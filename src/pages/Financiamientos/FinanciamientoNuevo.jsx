import { useNavigate } from 'react-router-dom'
import { crearFinanciamiento, getOpcionesFinanciamiento } from '../../api/financiamientos'
import ErrorCarga from '../../components/ErrorCarga'
import { EncabezadoFormulario, PaginaFormulario, VolverA } from '../../components/forms'
import { useRecurso } from '../../hooks/useRecurso'
import FinanciamientoForm from './FinanciamientoForm'
import './financiamientos.css'

export default function FinanciamientoNuevo() {
  const navigate = useNavigate()
  const { data: opciones, error, loading, recargar } = useRecurso(getOpcionesFinanciamiento)

  const guardar = async (cuerpo) => {
    await crearFinanciamiento(cuerpo)
    navigate('/financiamientos', { state: { aviso: 'Financiamiento creado.' } })
  }

  return (
    <PaginaFormulario>
      <VolverA to="/financiamientos">Financiamientos</VolverA>
      <EncabezadoFormulario
        titulo="Nuevo financiamiento"
        subtitulo="Registra una compra grande en tarjeta que vas a diferir en cuotas."
      />
      {loading && !opciones && <div className="skeleton" style={{ height: 520 }} />}
      {error && <ErrorCarga titulo="No se pudieron cargar los datos" error={error} onReintentar={recargar} />}
      {opciones && <FinanciamientoForm opciones={opciones} onGuardar={guardar} />}
    </PaginaFormulario>
  )
}
