import { useNavigate, useParams } from 'react-router-dom'
import { crearCuota, getFinanciamientoDetalle, getFinanciamientosDetalle } from '../../api/financiamientos'
import ErrorCarga from '../../components/ErrorCarga'
import { EncabezadoFormulario, PaginaFormulario, VolverA } from '../../components/forms'
import { useRecurso } from '../../hooks/useRecurso'
import CuotaForm from './CuotaForm'
import './financiamientos.css'

export default function CuotaNueva() {
  const { idFinanciamiento } = useParams()
  const navigate = useNavigate()
  const lista = useRecurso(getFinanciamientosDetalle)
  const actual = useRecurso((o) => getFinanciamientoDetalle(idFinanciamiento, o), [idFinanciamiento])

  const guardar = async (cuerpo) => {
    await crearCuota(cuerpo)
    navigate(`/financiamientos/${cuerpo.id_financiamiento}/editar`, { state: { aviso: 'Cuota creada.' } })
  }

  const listo = lista.data && actual.data
  const falla = lista.error ?? actual.error
  const siguiente = actual.data ? Math.max(0, ...actual.data.cuotas.map((c) => c.numero_cuota)) + 1 : null

  return (
    <PaginaFormulario>
      <VolverA to={`/financiamientos/${idFinanciamiento}/editar`}>Financiamiento</VolverA>
      <EncabezadoFormulario
        titulo="Nueva cuota"
        subtitulo="Agrega una cuota fuera del calendario generado automáticamente."
      />
      {!listo && !falla && <div className="skeleton" style={{ height: 360 }} />}
      {falla && (
        <ErrorCarga
          titulo="No se pudieron cargar los datos"
          error={falla}
          onReintentar={() => {
            lista.recargar()
            actual.recargar()
          }}
        />
      )}
      {listo && (
        <CuotaForm
          financiamientos={lista.data}
          financiamientoInicial={idFinanciamiento}
          numeroSugerido={siguiente}
          onGuardar={guardar}
        />
      )}
    </PaginaFormulario>
  )
}
