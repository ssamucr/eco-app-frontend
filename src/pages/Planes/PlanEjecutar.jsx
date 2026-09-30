import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getOpcionesMovimiento } from '../../api/movimientos'
import { ejecutarPlan, getPlanDetalle } from '../../api/planes'
import ErrorCarga from '../../components/ErrorCarga'
import {
  Campo,
  EncabezadoFormulario,
  ErrorFormulario,
  InputFecha,
  InputMonto,
  PaginaFormulario,
  Selector,
  TarjetaFormulario,
  VolverA,
} from '../../components/forms'
import { useRecurso } from '../../hooks/useRecurso'
import { TARJETA } from '../../lib/cuentas'
import { dinero, hoyIso, parseMonto, plural } from '../../lib/format'
import './planes.css'

function Formulario({ plan, opciones }) {
  const navigate = useNavigate()
  const [origen, setOrigen] = useState('')
  const [fecha, setFecha] = useState(hoyIso())
  const [base, setBase] = useState('')
  const [errores, setErrores] = useState({})
  const [vista, setVista] = useState(null)
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [ocupado, setOcupado] = useState(false)

  const cuentasOrigen = opciones.cuentas.filter((c) => c.tipo !== TARJETA)
  const cuerpo = (simular) => ({
    id_cuenta_origen: Number(origen),
    fecha,
    monto_base: plan.usa_porcentajes ? parseMonto(base) : null,
    simular,
  })

  // Cualquier cambio en los datos invalida el resumen ya calculado.
  const cambiar = (poner, campo) => (valor) => {
    poner(valor)
    setVista(null)
    setErrorGeneral(null)
    setErrores((previos) => ({ ...previos, [campo]: undefined }))
  }

  const validar = () => {
    const nuevos = {}
    if (!origen) nuevos.origen = 'Elige la cuenta de la que sale el dinero.'
    if (!fecha) nuevos.fecha = 'Elige una fecha.'
    if (plan.usa_porcentajes) {
      const importe = parseMonto(base)
      if (importe == null || Number.isNaN(importe) || importe <= 0) nuevos.base = 'Indica el monto a distribuir.'
    }
    return nuevos
  }

  const correr = async (simular) => {
    const nuevos = validar()
    setErrores(nuevos)
    setErrorGeneral(null)
    if (Object.keys(nuevos).length) return
    setOcupado(true)
    try {
      const resultado = await ejecutarPlan(plan.id_plan, cuerpo(simular))
      if (simular) {
        setVista(resultado)
      } else {
        navigate('/movimientos', {
          state: {
            aviso: `Plan ejecutado: ${plural(resultado.transacciones, 'movimiento', 'movimientos')} y ${plural(resultado.movimientos_subcuenta, 'asignación', 'asignaciones')} de subcuenta.`,
          },
        })
      }
    } catch (falla) {
      setVista(null)
      setErrorGeneral(falla.message)
    } finally {
      setOcupado(false)
    }
  }

  return (
    <>
      <TarjetaFormulario
        onSubmit={(evento) => {
          evento.preventDefault()
          correr(true)
        }}
      >
        <Campo
          id="origen"
          etiqueta="Cuenta de origen"
          error={errores.origen}
          ayuda="Es la cuenta que tiene el dinero a distribuir (por ejemplo, donde cayó el pago)."
        >
          <Selector
            id="origen"
            valor={origen}
            onChange={cambiar(setOrigen, 'origen')}
            vacio="Selecciona una cuenta"
            error={errores.origen}
            opciones={cuentasOrigen.map((c) => ({
              valor: String(c.id_cuenta),
              etiqueta: `${[c.nombre, c.entidad].filter(Boolean).join(' · ')} (${dinero(c.saldo)})`,
            }))}
          />
        </Campo>

        <div className="form-grid">
          <Campo id="fecha" etiqueta="Fecha" error={errores.fecha}>
            <InputFecha id="fecha" valor={fecha} onChange={cambiar(setFecha, 'fecha')} error={errores.fecha} />
          </Campo>
          {plan.usa_porcentajes && (
            <Campo
              id="base"
              etiqueta="Monto a distribuir"
              error={errores.base}
              ayuda="Sobre este monto se calculan los destinos con porcentaje."
            >
              <InputMonto id="base" valor={base} onChange={cambiar(setBase, 'base')} error={errores.base} />
            </Campo>
          )}
        </div>

        <ErrorFormulario mensaje={errorGeneral} />

        <div className="form-divider" />
        <div className="form-actions">
          <Link to={`/planes-recurrentes/${plan.id_plan}`} className="btn">
            Cancelar
          </Link>
          <button type="submit" className="btn" disabled={ocupado}>
            {ocupado && !vista ? 'Calculando…' : 'Ver resumen'}
          </button>
        </div>
      </TarjetaFormulario>

      {vista && (
        <section className="card preview" aria-live="polite">
          <h2 className="section-title">Resumen</h2>
          <p className="preview__sub">
            Sale de {vista.cuenta_origen} · saldo actual {dinero(vista.saldo_origen)}
          </p>
          <div className="preview__list">
            {vista.lineas.map((l) => (
              <div key={l.id_destino} className="preview__row">
                <div className="preview__main">
                  <p className="preview__name">{l.subcuenta ? `${l.subcuenta} (${l.cuenta})` : l.cuenta}</p>
                  <p className="preview__kind">{l.movimiento}</p>
                </div>
                <p className="preview__amount num">{dinero(l.monto)}</p>
              </div>
            ))}
          </div>
          <div className="preview__total">
            <span>Total a distribuir</span>
            <span className="num">{dinero(vista.total)}</span>
          </div>
          {vista.excede_saldo && (
            <p className="form-error" role="alert">
              El plan transfiere {dinero(vista.total_transferido)}, más de lo que tiene {vista.cuenta_origen}. Puedes ejecutarlo
              igual: la cuenta quedará en negativo.
            </p>
          )}
          <div className="form-actions">
            <button type="button" className="btn btn--primary" onClick={() => correr(false)} disabled={ocupado}>
              {ocupado ? 'Ejecutando…' : 'Ejecutar plan'}
            </button>
          </div>
        </section>
      )}
    </>
  )
}

export default function PlanEjecutar() {
  const { idPlan } = useParams()
  const opciones = useRecurso(getOpcionesMovimiento)
  const plan = useRecurso((o) => getPlanDetalle(idPlan, o), [idPlan])
  const listo = opciones.data && plan.data
  const falla = opciones.error ?? plan.error
  const ejecutable = plan.data && plan.data.activo && plan.data.destinos_activos > 0

  return (
    <PaginaFormulario>
      <VolverA to={`/planes-recurrentes/${idPlan}`}>{plan.data?.nombre ?? 'Plan'}</VolverA>
      <EncabezadoFormulario
        titulo="Ejecutar plan"
        subtitulo={plan.data ? `${plan.data.nombre} · ${plural(plan.data.destinos_activos, 'destino activo', 'destinos activos')}` : ' '}
      />
      {!listo && !falla && <div className="skeleton" style={{ height: 320 }} />}
      {falla && (
        <ErrorCarga
          titulo="No se pudo cargar el plan"
          error={falla}
          onReintentar={() => {
            opciones.recargar()
            plan.recargar()
          }}
        />
      )}
      {listo && !ejecutable && (
        <p className="form-error" role="alert">
          Este plan no se puede ejecutar: {plan.data.activo ? 'no tiene destinos activos' : 'está inactivo'}.{' '}
          <Link to={`/planes-recurrentes/${plan.data.id_plan}/editar`}>Editarlo</Link>
        </p>
      )}
      {listo && ejecutable && <Formulario plan={plan.data} opciones={opciones.data} />}
    </PaginaFormulario>
  )
}
