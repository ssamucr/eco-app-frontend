import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCalendario } from '../../api/financiamientos'
import {
  AccionesFormulario,
  Campo,
  ErrorFormulario,
  InputFecha,
  InputMonto,
  InputPorcentaje,
  InputTexto,
  Selector,
  TarjetaFormulario,
} from '../../components/forms'
import Icon from '../../components/Icon'
import { dinero, fechaCorta, hoyIso, montoParaInput, parseMonto } from '../../lib/format'

const texto = (id) => (id == null ? '' : String(id))
const enteroValido = (valor) => /^\d+$/.test(valor.trim()) && Number(valor) >= 1 && Number(valor) <= 360

// Vista previa (solo al crear): pide al servidor el mismo calendario que se generaría al guardar.
function CalendarioPrevio({ fecha, monto, cuotas }) {
  const [vista, setVista] = useState(null)
  useEffect(() => {
    const importe = parseMonto(monto)
    if (!fecha || !(importe > 0) || !enteroValido(cuotas)) {
      setVista(null)
      return undefined
    }
    const controlador = new AbortController()
    const espera = setTimeout(() => {
      getCalendario({ fecha_inicio: fecha, monto_total: importe, numero_cuotas: Number(cuotas) }, { signal: controlador.signal })
        .then(setVista)
        .catch(() => setVista(null))
    }, 300)
    return () => {
      clearTimeout(espera)
      controlador.abort()
    }
  }, [fecha, monto, cuotas])

  if (!vista) return <p className="field__help">Completa la fecha, el monto y el número de cuotas para ver el calendario.</p>
  const primera = vista.cuotas[0]
  const ultima = vista.cuotas[vista.cuotas.length - 1]
  return (
    <>
      <div className="quota quota--preview">
        <span className="chip chip--flat">Pendiente</span>
        <div className="quota__main">
          <p className="quota__title">
            Cuota 1 de {vista.cuotas.length}
          </p>
          <p className="quota__meta">Vence {fechaCorta(primera.fecha_vencimiento)}</p>
        </div>
        <span className="quota__amount num">{dinero(primera.monto)}</span>
      </div>
      {vista.cuotas.length > 1 && (
        <p className="field__help">
          y {vista.cuotas.length - 1} {vista.cuotas.length - 1 === 1 ? 'cuota más' : 'cuotas más'}, hasta el{' '}
          {fechaCorta(ultima.fecha_vencimiento)} ({dinero(ultima.monto)} la última).
        </p>
      )}
    </>
  )
}

// Calendario real (al editar): pagadas, la próxima y las pendientes.
function CalendarioReal({ financiamiento: f }) {
  const [todas, setTodas] = useState(false)
  const visibles = todas ? f.cuotas : f.cuotas.slice(0, 4)
  const ocultas = f.cuotas.length - visibles.length
  return (
    <div>
      <div className="quota-head">
        <p className="field__label" style={{ margin: 0 }}>
          Calendario de cuotas
        </p>
        <p className="field__help" style={{ margin: 0 }}>
          {f.cuotas_pagadas} de {f.cuotas_total} pagadas · {dinero(f.monto_restante)} restantes
        </p>
      </div>
      {f.cuotas.length === 0 && <p className="field__help">Este financiamiento todavía no tiene cuotas.</p>}
      {f.cuotas.length > 0 && (
        <div className="calendar">
          {visibles.map((c) => (
            <div key={c.id_cuota_financiamiento} className={`quota ${c.es_proxima ? 'quota--next' : ''}`}>
              <div className={`quota__state ${c.pagada ? 'quota__state--paid' : ''}`}>
                <Icon nombre={c.pagada ? 'check' : 'reloj'} size={14} strokeWidth={2} />
              </div>
              <div className="quota__main">
                <p className="quota__title">
                  Cuota {c.numero_cuota} de {f.numero_cuotas}
                  {c.es_proxima && <span className="quota__next">Próxima</span>}
                </p>
                <p className="quota__meta">
                  {['Vence ' + fechaCorta(c.fecha_vencimiento), c.pagada && `Pagada el ${fechaCorta(c.fecha_pago)}`]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
              <span className="quota__amount num">{dinero(c.monto)}</span>
              {!c.pagada && (
                <Link to={`/cuotas-financiamiento/${c.id_cuota_financiamiento}/pagar`} className="btn btn--small">
                  Pagar
                </Link>
              )}
              <Link
                to={`/cuotas-financiamiento/${c.id_cuota_financiamiento}/editar`}
                aria-label={`Editar cuota ${c.numero_cuota}`}
                className="icon-btn icon-btn--xs"
              >
                <Icon nombre="editar" size={14} strokeWidth={1.7} />
              </Link>
            </div>
          ))}
          {ocultas > 0 && (
            <button type="button" className="calendar__more" onClick={() => setTodas(true)}>
              + {ocultas} {ocultas === 1 ? 'cuota más' : 'cuotas más'}, con vencimiento hasta el{' '}
              {fechaCorta(f.cuotas[f.cuotas.length - 1].fecha_vencimiento)} · Mostrar todas
            </button>
          )}
        </div>
      )}
      <div style={{ marginTop: 10 }}>
        <Link to={`/financiamientos/${f.id_financiamiento}/cuotas/nueva`} className="dashed-btn">
          <Icon nombre="agregar" size={14} strokeWidth={2} />
          Agregar cuota manualmente
        </Link>
      </div>
    </div>
  )
}

export default function FinanciamientoForm({ opciones, financiamiento: f, onGuardar, onEliminar }) {
  const editando = Boolean(f)
  const [descripcion, setDescripcion] = useState(f?.descripcion ?? '')
  const [origen, setOrigen] = useState(texto(f?.id_transaccion_origen))
  const [fecha, setFecha] = useState(f?.fecha_inicio ?? hoyIso())
  const [monto, setMonto] = useState(f ? montoParaInput(f.monto_total) : '')
  const [cuotas, setCuotas] = useState(f ? String(f.numero_cuotas) : '')
  const [tasa, setTasa] = useState(f?.tasa_interes != null ? montoParaInput(f.tasa_interes) : '')
  const [generar, setGenerar] = useState(true)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const compras = opciones.compras_tarjeta
  const hayOrigen = !origen || compras.some((c) => String(c.id_transaccion) === origen)
  const opcionesOrigen = compras.map((c) => ({
    valor: String(c.id_transaccion),
    etiqueta: `${c.descripcion || 'Compra'} · ${c.tarjeta} · ${fechaCorta(c.fecha)}`,
  }))
  if (!hayOrigen) opcionesOrigen.unshift({ valor: origen, etiqueta: `Transacción vinculada (#${origen})` })

  const alCambiar = (campo, poner) => (valor) => {
    poner(valor)
    setErrores((previos) => ({ ...previos, [campo]: undefined }))
  }

  const validar = () => {
    const nuevos = {}
    const importe = parseMonto(monto)
    const interes = parseMonto(tasa)
    if (!descripcion.trim()) nuevos.descripcion = 'Escribe una descripción.'
    if (!fecha) nuevos.fecha = 'Elige la fecha de inicio.'
    if (importe == null || Number.isNaN(importe) || importe <= 0) nuevos.monto = 'Ingresa un monto mayor que 0.'
    if (!enteroValido(cuotas)) nuevos.cuotas = 'Ingresa un número de cuotas entre 1 y 360.'
    if (Number.isNaN(interes) || (interes != null && (interes < 0 || interes > 100))) nuevos.tasa = 'Ingresa una tasa entre 0 y 100.'
    return nuevos
  }

  const enviar = async (evento) => {
    evento.preventDefault()
    const nuevos = validar()
    setErrores(nuevos)
    setErrorGeneral(null)
    if (Object.keys(nuevos).length) return
    const cuerpo = {
      descripcion: descripcion.trim(),
      fecha_inicio: fecha,
      monto_total: parseMonto(monto),
      numero_cuotas: Number(cuotas),
      tasa_interes: parseMonto(tasa),
      id_transaccion_origen: origen ? Number(origen) : null,
    }
    if (!editando) cuerpo.generar_cuotas = generar
    setGuardando(true)
    try {
      await onGuardar(cuerpo)
    } catch (falla) {
      setErrorGeneral(falla.message)
      setGuardando(false)
    }
  }

  return (
    <TarjetaFormulario onSubmit={enviar}>
      <Campo id="descripcion" etiqueta="Descripción" error={errores.descripcion}>
        <InputTexto
          id="descripcion"
          valor={descripcion}
          onChange={alCambiar('descripcion', setDescripcion)}
          placeholder="Ej. Laptop nueva"
          error={errores.descripcion}
          maxLength={100}
          autoFocus={!editando}
        />
      </Campo>

      <Campo
        id="origen"
        etiqueta="Transacción origen"
        opcional
        ayuda="La compra en tarjeta que dio origen a este financiamiento, si ya la registraste como movimiento."
      >
        <Selector id="origen" valor={origen} onChange={setOrigen} vacio="Ninguna" opciones={opcionesOrigen} />
      </Campo>

      <div className="form-grid">
        <Campo id="fecha" etiqueta="Fecha de inicio" error={errores.fecha}>
          <InputFecha id="fecha" valor={fecha} onChange={alCambiar('fecha', setFecha)} error={errores.fecha} />
        </Campo>
        <Campo id="monto" etiqueta="Monto total" error={errores.monto}>
          <InputMonto id="monto" valor={monto} onChange={alCambiar('monto', setMonto)} error={errores.monto} />
        </Campo>
      </div>

      <div className="form-grid">
        <Campo
          id="cuotas"
          etiqueta="Número de cuotas"
          error={errores.cuotas}
          ayuda={editando ? 'Cambiar este número no reordena las cuotas ya creadas.' : undefined}
        >
          <InputTexto
            id="cuotas"
            valor={cuotas}
            onChange={alCambiar('cuotas', setCuotas)}
            inputMode="numeric"
            placeholder="Ej. 12"
            error={errores.cuotas}
            maxLength={3}
          />
        </Campo>
        <Campo id="tasa" etiqueta="Tasa de interés mensual" opcional error={errores.tasa}>
          <InputPorcentaje id="tasa" valor={tasa} onChange={alCambiar('tasa', setTasa)} error={errores.tasa} />
        </Campo>
      </div>

      <div className="form-divider" />

      {editando ? (
        <CalendarioReal financiamiento={f} />
      ) : (
        <div>
          <p className="field__label">Calendario de cuotas</p>
          <label className="switch">
            <input type="checkbox" checked={generar} onChange={(evento) => setGenerar(evento.target.checked)} />
            <span>Generar las cuotas automáticamente, en montos iguales, a partir de la fecha de inicio</span>
          </label>
          {generar ? (
            <CalendarioPrevio fecha={fecha} monto={monto} cuotas={cuotas} />
          ) : (
            <p className="field__help">
              No se crearán cuotas: podrás agregarlas una por una desde la pantalla del financiamiento, con el monto y la
              fecha que necesites.
            </p>
          )}
        </div>
      )}

      <ErrorFormulario mensaje={errorGeneral} />

      <AccionesFormulario
        izquierda={
          editando && (
            <button type="button" className="link-danger" onClick={onEliminar}>
              Eliminar financiamiento
            </button>
          )
        }
      >
        <Link to="/financiamientos" className="btn">
          Cancelar
        </Link>
        <button type="submit" className="btn btn--primary" disabled={guardando}>
          {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear financiamiento'}
        </button>
      </AccionesFormulario>
    </TarjetaFormulario>
  )
}
