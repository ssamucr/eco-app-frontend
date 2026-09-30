import { Link } from 'react-router-dom'
import { getPersonasDetalle } from '../../api/personas'
import AccionesRapidas from '../../components/AccionesRapidas'
import Aviso from '../../components/Aviso'
import ConfirmDialog from '../../components/ConfirmDialog'
import ErrorCarga from '../../components/ErrorCarga'
import Icon from '../../components/Icon'
import { useAviso } from '../../hooks/useAviso'
import { useConfirmarEliminacion } from '../../hooks/useConfirmarEliminacion'
import { useRecurso } from '../../hooks/useRecurso'
import { dineroConSigno, plural } from '../../lib/format'
import { estadoBalance } from '../../lib/personas'
import Avatar from './Avatar'
import { eliminarPersonaConfig } from './eliminaciones'
import './personas.css'

function resumen(persona) {
  if (persona.pendientes === 0) return 'Sin obligaciones pendientes'
  const cantidad = plural(persona.pendientes, 'obligación', 'obligaciones')
  return persona.concepto ? `${cantidad} · ${persona.concepto}` : cantidad
}

function Fila({ persona, onEliminar }) {
  const estado = estadoBalance(persona.balance)
  return (
    <div className="person">
      <Link to={`/personas/${persona.id_persona}`} className="person__link">
        <Avatar persona={persona} />
        <div className="person__main">
          <p className="person__name">{persona.nombre}</p>
          <p className="person__meta">{resumen(persona)}</p>
        </div>
        <div className="person__side">
          <p className={`person__amount num ${estado.clase}`}>{dineroConSigno(persona.balance)}</p>
          <p className="person__state">{estado.texto}</p>
        </div>
      </Link>
      <div className="person__actions">
        <Link to={`/personas/${persona.id_persona}/editar`} aria-label={`Editar ${persona.nombre}`} className="icon-btn icon-btn--sm">
          <Icon nombre="editar" size={16} strokeWidth={1.6} />
        </Link>
        <button type="button" aria-label={`Eliminar ${persona.nombre}`} className="icon-btn icon-btn--sm" onClick={() => onEliminar(persona)}>
          <Icon nombre="eliminar" size={16} strokeWidth={1.6} />
        </button>
      </div>
    </div>
  )
}

export default function Personas() {
  const { data, error, loading, recargar } = useRecurso(getPersonasDetalle)
  const { pedir, dialogoProps } = useConfirmarEliminacion()
  const [aviso, setAviso] = useAviso()

  const eliminar = (persona) =>
    pedir(
      eliminarPersonaConfig(persona, () => {
        setAviso('Persona eliminada.')
        recargar()
      }),
    )
  const neto = data?.balance_neto ?? 0

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Personas</h1>
          <p className="page-subtitle">
            {data ? (
              <>
                {plural(data.personas.length, 'persona', 'personas')} · Balance neto{' '}
                <span className={`${estadoBalance(neto).clase} strong`}>{dineroConSigno(neto)}</span>
              </>
            ) : (
              ' '
            )}
          </p>
        </div>
        <AccionesRapidas />
      </div>

      <div className="page-toolbar">
        <Link to="/personas/nueva" className="quickbtn quickbtn--primary quickbtn--lg">
          <Icon nombre="agregar" size={15} strokeWidth={2} />
          Nueva persona
        </Link>
      </div>

      <Aviso mensaje={aviso} onCerrar={() => setAviso(null)} />

      {loading && !data && (
        <>
          <div className="skeleton" style={{ height: 76 }} />
          <div className="skeleton" style={{ height: 76 }} />
          <div className="skeleton" style={{ height: 76 }} />
        </>
      )}
      {error && <ErrorCarga titulo="No se pudieron cargar las personas" error={error} onReintentar={recargar} />}
      {data && data.personas.length === 0 && <p className="empty">Todavía no has agregado personas.</p>}

      {data && (
        <div className="people">
          {data.personas.map((persona) => (
            <Fila key={persona.id_persona} persona={persona} onEliminar={eliminar} />
          ))}
        </div>
      )}

      <ConfirmDialog {...dialogoProps} />
    </>
  )
}
