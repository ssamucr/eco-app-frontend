import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ajustarCiclo, getCiclos } from '../../api/ciclos'
import ErrorCarga from '../../components/ErrorCarga'
import { InputFecha, PaginaFormulario, EncabezadoFormulario, VolverA } from '../../components/forms'
import { useRecurso } from '../../hooks/useRecurso'
import { fechaCorta, hoyIso, plural, rangoFechas } from '../../lib/format'
import './ciclos.css'

function Periodo({ ciclo: c, hoy, onGuardado }) {
  const [editando, setEditando] = useState(false)
  const [inicio, setInicio] = useState(c.fecha_inicio)
  const [error, setError] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const futuro = c.fecha_inicio > hoy

  const guardar = async () => {
    setGuardando(true)
    setError(null)
    try {
      await ajustarCiclo(c.id_ciclo, inicio)
      setEditando(false)
      onGuardado()
    } catch (falla) {
      setError(falla.message)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className={`period ${c.es_actual ? 'period--now' : ''}`}>
      <div className="period__main">
        <p className="period__range">{rangoFechas(c.fecha_inicio, c.fecha_fin)}</p>
        <p className="period__meta">
          {[plural(c.dias, 'día', 'días'), c.es_actual && 'Ciclo actual', futuro && 'Próximo', c.ajustado && 'Ajustado a mano']
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>
      {!futuro && (
        <Link to={`/?ciclo=${c.id_ciclo}`} className="link">
          Ver en Resumen
        </Link>
      )}
      {!editando && (
        <button type="button" className="btn btn--small" onClick={() => setEditando(true)}>
          Ajustar inicio
        </button>
      )}
      {editando && (
        <div className="period__edit">
          <InputFecha id={`inicio-${c.id_ciclo}`} valor={inicio} onChange={setInicio} aria-label="Nuevo inicio del ciclo" />
          <button type="button" className="btn btn--small btn--primary" onClick={guardar} disabled={guardando || !inicio}>
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
          <button
            type="button"
            className="btn btn--small"
            onClick={() => {
              setEditando(false)
              setInicio(c.fecha_inicio)
              setError(null)
            }}
          >
            Cancelar
          </button>
          {error && <p className="period__error" role="alert">{error}</p>}
          <p className="field__help" style={{ flexBasis: '100%', margin: 0 }}>
            El ciclo anterior terminará el día previo. Hoy es {fechaCorta(hoy)}.
          </p>
        </div>
      )}
    </div>
  )
}

export default function Periodos() {
  const { idConfig } = useParams()
  const { data, error, loading, recargar } = useRecurso((o) => getCiclos(Number(idConfig), 48, o), [idConfig])
  const hoy = hoyIso()

  return (
    <PaginaFormulario>
      <VolverA to="/ciclos">Ciclos</VolverA>
      <EncabezadoFormulario
        titulo={data?.config ? `Ciclos de ${data.config.nombre}` : 'Ciclos'}
        subtitulo="Si tu paga llegó otro día, ajusta el inicio del ciclo."
      />
      {loading && !data && <div className="skeleton" style={{ height: 320 }} />}
      {error && <ErrorCarga titulo="No se pudieron cargar los ciclos" error={error} onReintentar={recargar} />}
      {data && (
        <div className="card" style={{ padding: '6px 10px' }}>
          {data.ciclos.map((c) => (
            <Periodo key={`${c.id_ciclo}-${c.fecha_inicio}`} ciclo={c} hoy={hoy} onGuardado={recargar} />
          ))}
        </div>
      )}
    </PaginaFormulario>
  )
}
