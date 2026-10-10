import { Link } from 'react-router-dom'
import { getConfigsCiclos } from '../../api/ciclos'
import Aviso from '../../components/Aviso'
import ConfirmDialog from '../../components/ConfirmDialog'
import ErrorCarga from '../../components/ErrorCarga'
import Icon from '../../components/Icon'
import { useAviso } from '../../hooks/useAviso'
import { useConfirmarEliminacion } from '../../hooks/useConfirmarEliminacion'
import { useRecurso } from '../../hooks/useRecurso'
import { etiquetaAjuste, textoDias } from '../../lib/ciclos'
import { rangoFechas } from '../../lib/format'
import { eliminarConfigConfig } from './eliminaciones'
import './ciclos.css'

function Fila({ config: c, onEliminar }) {
  return (
    <div className="card cfg">
      <div className="cfg__main">
        <p className="cfg__name">
          {c.nombre}
          {c.es_principal && <span className="chip chip--flat">Principal</span>}
          {!c.activo && <span className="chip chip--flat">Inactiva</span>}
        </p>
        <p className="cfg__meta">{[textoDias(c.dias), etiquetaAjuste(c.ajuste_fin_semana)].join(' · ')}</p>
        {c.ciclo_actual && (
          <p className="cfg__meta">Ciclo actual: {rangoFechas(c.ciclo_actual.fecha_inicio, c.ciclo_actual.fecha_fin)}</p>
        )}
      </div>
      <div className="cfg__actions">
        <Link to={`/ciclos/${c.id_ciclo_config}/periodos`} className="btn btn--small">
          Ver ciclos
        </Link>
        <Link to={`/ciclos/${c.id_ciclo_config}/editar`} aria-label={`Editar ${c.nombre}`} className="icon-btn">
          <Icon nombre="editar" size={15} strokeWidth={1.6} />
        </Link>
        <button type="button" aria-label={`Eliminar ${c.nombre}`} className="icon-btn" onClick={() => onEliminar(c)}>
          <Icon nombre="eliminar" size={15} strokeWidth={1.6} />
        </button>
      </div>
    </div>
  )
}

export default function Ciclos() {
  const { data, error, loading, recargar } = useRecurso(getConfigsCiclos)
  const { pedir, dialogoProps } = useConfirmarEliminacion()
  const [aviso, setAviso] = useAviso()

  const eliminar = (config) =>
    pedir(
      eliminarConfigConfig(config, () => {
        setAviso('Configuración eliminada.')
        recargar()
      }),
    )

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Ciclos</h1>
          <p className="page-subtitle">Los períodos entre dos pagas: de ahí salen los ingresos y gastos del Resumen.</p>
        </div>
        <Link to="/ciclos/nueva" className="quickbtn quickbtn--primary">
          <Icon nombre="agregar" size={15} strokeWidth={1.9} />
          Nueva configuración
        </Link>
      </div>

      <Aviso mensaje={aviso} onCerrar={() => setAviso(null)} />

      {loading && !data && <div className="skeleton" style={{ height: 120 }} />}
      {error && <ErrorCarga titulo="No se pudieron cargar los ciclos" error={error} onReintentar={recargar} />}
      {data && data.length === 0 && (
        <p className="empty">
          Todavía no tienes ciclos. Crea una configuración (por ejemplo, los días 10 y 25) y el Resumen mostrará el ciclo actual.
        </p>
      )}
      {data && data.map((c) => <Fila key={c.id_ciclo_config} config={c} onEliminar={eliminar} />)}

      <ConfirmDialog {...dialogoProps} />
    </>
  )
}
