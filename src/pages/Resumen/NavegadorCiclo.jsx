import { Link, useNavigate } from 'react-router-dom'
import { getCicloActual, getConfigsCiclos } from '../../api/ciclos'
import Icon from '../../components/Icon'
import { Selector } from '../../components/forms'
import { useRecurso } from '../../hooks/useRecurso'
import { plural, rangoFechas } from '../../lib/format'


// Ciclo que muestra el Resumen, con flechas para ir al anterior o al siguiente.
// `enlace(id)` arma la dirección de cada ciclo; por defecto el Resumen.
const enlaceResumen = (id) => (id ? `/?ciclo=${id}` : '/')

export default function NavegadorCiclo({ ciclo, enlace = enlaceResumen }) {
  const navigate = useNavigate()
  const configs = useRecurso(getConfigsCiclos)
  const activas = (configs.data ?? []).filter((c) => c.activo)

  const cambiarConfig = async (id) => {
    if (!id || Number(id) === ciclo.id_ciclo_config) return
    const actual = await getCicloActual(Number(id))
    if (actual) navigate(enlace(actual.id_ciclo))
  }

  const sinConfiguracion = ciclo.id_ciclo == null

  return (
    <div className="cycle-nav">
      <div className="cycle-nav__row">
        {!sinConfiguracion && (
          <Link
            to={enlace(ciclo.id_anterior)}
            className={`icon-btn ${ciclo.id_anterior ? '' : 'is-disabled'}`}
            aria-label="Ciclo anterior"
            aria-disabled={!ciclo.id_anterior}
            tabIndex={ciclo.id_anterior ? 0 : -1}
          >
            <Icon nombre="volver" size={16} strokeWidth={1.9} />
          </Link>
        )}
        <div className="cycle-nav__label">
          <p className="cycle-nav__range">{rangoFechas(ciclo.fecha_inicio, ciclo.fecha_fin)}</p>
          <p className="cycle-nav__meta">
            {ciclo.config} · {plural(ciclo.dias, 'día', 'días')}
            {ciclo.es_actual ? ' · Ciclo actual' : ''}
          </p>
        </div>
        {!sinConfiguracion && (
          <Link
            to={enlace(ciclo.id_siguiente)}
            className={`icon-btn ${ciclo.id_siguiente ? '' : 'is-disabled'}`}
            aria-label="Ciclo siguiente"
            aria-disabled={!ciclo.id_siguiente}
            tabIndex={ciclo.id_siguiente ? 0 : -1}
          >
            <Icon nombre="siguiente" size={16} strokeWidth={1.9} />
          </Link>
        )}
      </div>

      <div className="cycle-nav__extra">
        {!ciclo.es_actual && (
          <Link to={enlace(null)} className="btn btn--small btn--primary">
            Volver al ciclo actual
          </Link>
        )}
        {activas.length > 1 && (
          <div className="cycle-nav__select">
            <Selector
              id="ciclo-config"
              valor={String(ciclo.id_ciclo_config ?? '')}
              onChange={cambiarConfig}
              opciones={activas.map((c) => ({ valor: String(c.id_ciclo_config), etiqueta: c.nombre }))}
              aria-label="Tipo de ciclo"
            />
          </div>
        )}
        <Link to="/ciclos" className="btn btn--small">
          <Icon nombre="calendario" size={14} strokeWidth={1.8} />
          {sinConfiguracion ? 'Configurar ciclos' : 'Administrar ciclos'}
        </Link>
      </div>
    </div>
  )
}
