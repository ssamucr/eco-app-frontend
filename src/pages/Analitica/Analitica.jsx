import { Link, useSearchParams } from 'react-router-dom'
import { getAnalitica } from '../../api/analitica'
import ErrorCarga from '../../components/ErrorCarga'
import { useRecurso } from '../../hooks/useRecurso'
import { fechaLarga, plural } from '../../lib/format'
import NavegadorCiclo from '../Resumen/NavegadorCiclo'
import ExportarMenu from './ExportarMenu'
import {
  Categorias,
  Deuda,
  GastosHormiga,
  GraficaBarras,
  GraficaCiclos,
  GraficaPatrimonio,
  Insights,
  Kpis,
  Mayores,
  Metas,
  Obligaciones,
  PorCuenta,
  Recurrentes,
  Ritmo,
  Tarjeta,
} from './secciones'
import './analitica.css'

const CANTIDADES = [3, 6, 12]

function Cargando() {
  return (
    <>
      <div className="kpi-row">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: 112 }} />
        ))}
      </div>
      <div className="skeleton" style={{ height: 260 }} />
      <div className="skeleton" style={{ height: 320 }} />
    </>
  )
}

export default function Analitica() {
  const [params, setParams] = useSearchParams()
  const idCiclo = Number(params.get('ciclo')) || null
  const pedidos = Number(params.get('n'))
  const ciclos = CANTIDADES.includes(pedidos) ? pedidos : 6
  const { data, error, loading, recargar } = useRecurso((o) => getAnalitica(idCiclo, ciclos, o), [idCiclo, ciclos])

  const enlace = (id) => `/analitica?${id ? `ciclo=${id}&` : ''}n=${ciclos}`
  const cambiarCantidad = (n) => {
    const nuevos = new URLSearchParams(params)
    nuevos.set('n', String(n))
    setParams(nuevos)
  }

  const exportar = data && { idCiclo: data.ciclo.id_ciclo, ciclos, ciclo: data.ciclo }
  const sinHistoria = data && data.historial.length < 2

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analítica</h1>
          <p className="page-subtitle">{data ? fechaLarga(data.fecha) : ' '}</p>
        </div>
        {data && <ExportarMenu {...exportar} secciones={undefined} etiqueta="Exportar todo" chico={false} />}
      </div>

      {data && <NavegadorCiclo ciclo={data.ciclo} enlace={enlace} />}

      {data && (
        <div className="an-cantidad" role="radiogroup" aria-label="Ciclos a comparar">
          <span>Comparar con los últimos</span>
          {CANTIDADES.map((n) => (
            <button key={n} type="button" role="radio" aria-checked={ciclos === n} className={`segmented__option ${ciclos === n ? 'is-active' : ''}`} onClick={() => cambiarCantidad(n)}>
              {n} ciclos
            </button>
          ))}
        </div>
      )}

      {loading && !data && <Cargando />}
      {error && <ErrorCarga titulo="No se pudo cargar la analítica" error={error} onReintentar={recargar} />}

      {data && (
        <>
          {data.historial_corto && (
            <p className="an-aviso" role="note">
              Todavía hay poca historia: los promedios y las comparaciones con «tu promedio» aparecen cuando tengas al menos{' '}
              {plural(data.ciclos_para_promedio, 'ciclo completo', 'ciclos completos')} anteriores. Mientras tanto verás la comparación con el ciclo anterior.
            </p>
          )}

          <Kpis datos={data} />

          <Tarjeta titulo="Lo que debes saber" subtitulo="Hallazgos de este ciclo" secciones={['resumen']} exportar={exportar} ancha>
            <Insights insights={data.insights} />
          </Tarjeta>

          <div className="an-grid">
            <Tarjeta titulo="Ingresos y gastos por ciclo" subtitulo={sinHistoria ? 'Solo hay un ciclo con datos' : `Últimos ${plural(data.historial.length, 'ciclo', 'ciclos')}`} secciones={['ciclos']} exportar={exportar}>
              <GraficaCiclos historial={data.historial} />
            </Tarjeta>
            <Tarjeta titulo="Patrimonio por ciclo" subtitulo="Al cierre de cada ciclo" secciones={['ciclos']} exportar={exportar}>
              <GraficaPatrimonio historial={data.historial} />
            </Tarjeta>
          </div>

          <Tarjeta titulo="Ritmo del ciclo" subtitulo="Gasto acumulado día a día frente al ciclo anterior" secciones={['ritmo']} exportar={exportar} ancha>
            <Ritmo ritmo={data.ritmo} />
          </Tarjeta>

          <div className="an-grid">
            <Tarjeta titulo="Gastos por categoría" subtitulo="Toca una categoría para ver sus movimientos" secciones={['gastos']} exportar={exportar}>
              <Categorias categorias={data.gastos.categorias} ciclo={data.ciclo} />
            </Tarjeta>
            <div className="an-col">
              <Tarjeta titulo="Mayores gastos" secciones={['gastos']} exportar={exportar}>
                <Mayores mayores={data.gastos.mayores} />
              </Tarjeta>
              <Tarjeta titulo="Gasto por cuenta o tarjeta" secciones={['gastos']} exportar={exportar}>
                <PorCuenta cuentas={data.gastos.por_cuenta} />
              </Tarjeta>
            </div>
          </div>

          <div className="an-grid">
            <Tarjeta titulo="Gasto por día de la semana" subtitulo={`Según ${plural(data.patrones.ciclos_usados, 'ciclo', 'ciclos')}`} secciones={['patrones']} exportar={exportar}>
              <GraficaBarras datos={data.patrones.por_dia_semana.map((d) => ({ ...d, dia: d.dia.slice(0, 3) }))} etiqueta="dia" clave="total" nombre="Gasto" color="#2a78d6" />
            </Tarjeta>
            <Tarjeta titulo="Gasto promedio por día del ciclo" subtitulo="¿Gastas más justo después de la paga?" secciones={['patrones']} exportar={exportar}>
              <GraficaBarras datos={data.patrones.por_dia_ciclo} etiqueta="dia" clave="promedio" nombre="Promedio" color="#eb6834" />
            </Tarjeta>
          </div>

          <div className="an-grid">
            <Tarjeta titulo="Gastos recurrentes" subtitulo="Misma descripción en 2 o más ciclos" secciones={['patrones']} exportar={exportar}>
              <Recurrentes lista={data.patrones.recurrentes} />
              <GastosHormiga hormiga={data.gastos.hormiga} />
            </Tarjeta>
            <Tarjeta titulo="Metas y subcuentas" subtitulo="Avance y fecha estimada" secciones={['metas']} exportar={exportar}>
              <Metas metas={data.metas} />
            </Tarjeta>
          </div>

          <div className="an-grid">
            <Tarjeta titulo="Deuda y financiamientos" secciones={['deuda']} exportar={exportar}>
              <Deuda deuda={data.deuda} />
            </Tarjeta>
            <Tarjeta titulo="Personas y obligaciones" secciones={['obligaciones']} exportar={exportar}>
              <Obligaciones datos={data.obligaciones} />
            </Tarjeta>
          </div>

          <p className="an-pie">
            ¿Quieres revisar el detalle? Mira tus{' '}
            <Link to={data.ciclo.id_ciclo ? `/movimientos?ciclo=${data.ciclo.id_ciclo}` : '/movimientos'} className="link">
              movimientos de este ciclo
            </Link>{' '}
            o expórtalos con «Exportar todo».
          </p>
        </>
      )}
    </>
  )
}
