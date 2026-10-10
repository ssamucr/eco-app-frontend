import { Link, useSearchParams } from 'react-router-dom'
import Icon from '../../components/Icon'
import { useResumen } from '../../hooks/useResumen'
import { fechaLarga } from '../../lib/format'
import ActividadReciente from './ActividadReciente'
import CuentaCard from './CuentaCard'
import GastosPorCategoria from './GastosPorCategoria'
import KpiRow from './KpiRow'
import NavegadorCiclo from './NavegadorCiclo'
import PeriodoRow from './PeriodoRow'
import ObligacionesResumen from './ObligacionesResumen'
import './resumen.css'

function Cabecera({ fecha }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">Resumen</h1>
        <p className="page-subtitle">{fecha ? fechaLarga(fecha) : ' '}</p>
      </div>
      <div className="quick-actions">
        <Link to="/obligaciones/nueva" className="quickbtn">
          <Icon nombre="obligaciones" size={15} strokeWidth={1.8} />
          Obligación
        </Link>
        <Link to="/transferencias/nueva?tipo=GASTO" className="quickbtn">
          <Icon nombre="menos" size={15} strokeWidth={1.8} />
          Gasto
        </Link>
        <Link to="/transferencias/nueva" className="quickbtn quickbtn--primary">
          <Icon nombre="transferencia" size={15} strokeWidth={1.8} />
          Transferencia
        </Link>
      </div>
    </div>
  )
}

function Cargando() {
  return (
    <>
      <div className="kpi-row">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: 112 }} />
        ))}
      </div>
      <div className="resumen-body">
        <div className="skeleton" style={{ height: 560 }} />
        <div className="skeleton" style={{ height: 560 }} />
      </div>
    </>
  )
}

function ErrorCard({ error, onReintentar }) {
  return (
    <div className="card error-card" role="alert">
      <p className="error-card__title">No se pudo cargar el resumen</p>
      <p className="error-card__text">{error.message}</p>
      <button type="button" className="retry" onClick={onReintentar}>
        Reintentar
      </button>
    </div>
  )
}

export default function Resumen() {
  const [params] = useSearchParams()
  const idCiclo = Number(params.get('ciclo')) || null
  const { data, error, loading, reintentar } = useResumen(idCiclo)

  return (
    <>
      <Cabecera fecha={data?.fecha} />

      {loading && <Cargando />}
      {error && <ErrorCard error={error} onReintentar={reintentar} />}

      {data && (
        <>
          <NavegadorCiclo ciclo={data.ciclo} />
          <PeriodoRow periodo={data.periodo} />
          <KpiRow kpis={data.kpis} obligaciones={data.obligaciones} cierre={!data.ciclo.es_actual && data.ciclo.fecha_fin < data.fecha} />

          <div className="resumen-body">
            <div className="column">
              <div className="accounts">
                <div className="section-head">
                  <h2 className="section-title">Cuentas</h2>
                  <Link to="/cuentas" className="link">
                    Ver todas
                  </Link>
                </div>
                {data.cuentas.map((cuenta) => (
                  <CuentaCard key={cuenta.id_cuenta} cuenta={cuenta} />
                ))}
              </div>
              <ActividadReciente transacciones={data.actividad_reciente} hoy={data.fecha} />
            </div>

            <div className="column">
              <GastosPorCategoria gastos={data.gastos_por_categoria} ciclo={data.ciclo} />
              <ObligacionesResumen obligaciones={data.obligaciones} />
            </div>
          </div>
        </>
      )}
    </>
  )
}
