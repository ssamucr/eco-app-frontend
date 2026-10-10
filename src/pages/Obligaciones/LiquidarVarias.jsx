import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getObligacionesDetalle, getOpcionesObligacion, liquidarLote } from '../../api/obligaciones'
import ErrorCarga from '../../components/ErrorCarga'
import {
  AccionesFormulario,
  Campo,
  EncabezadoFormulario,
  ErrorFormulario,
  InputFecha,
  InputTexto,
  PaginaFormulario,
  TarjetaFormulario,
  VolverA,
} from '../../components/forms'
import { useRecurso } from '../../hooks/useRecurso'
import { dinero, hoyIso, plural } from '../../lib/format'
import OrigenLiquidacion, { esEntrada } from './OrigenLiquidacion'
import './obligaciones.css'

const GRUPOS = [
  { clave: 'debes', titulo: 'Debes' },
  { clave: 'reposiciones', titulo: 'Reposiciones' },
  { clave: 'te_deben', titulo: 'Te deben' },
]

const nombreDe = (o) => [o.persona, o.concepto].filter(Boolean).join(' · ') || 'Obligación'

function ListaElegible({ lista, titulo, elegidas, bloqueada, onAlternar, onTodas }) {
  if (lista.length === 0) return null
  const todas = lista.every((o) => elegidas.has(o.id_obligacion))
  return (
    <fieldset className="pick" disabled={bloqueada}>
      <legend className="pick__title">
        <span>{titulo}</span>
        <button type="button" className="link-btn" onClick={() => onTodas(lista, !todas)} disabled={bloqueada}>
          {todas ? 'Quitar todas' : 'Elegir todas'}
        </button>
      </legend>
      {lista.map((o) => (
        <label key={o.id_obligacion} className="pick__row">
          <input
            type="checkbox"
            checked={elegidas.has(o.id_obligacion)}
            onChange={() => onAlternar(o.id_obligacion)}
          />
          <span className="pick__main">
            <span className="pick__name">{nombreDe(o)}</span>
            {o.tipo === 'REPOSICION' && (
              <span className="pick__meta">
                Se salda en {[o.cuenta_destino, o.subcuenta_destino].filter(Boolean).join(' · ')}
              </span>
            )}
          </span>
          <span className="pick__amount num">{dinero(o.monto_pendiente)}</span>
        </label>
      ))}
    </fieldset>
  )
}

function Formulario({ detalle, opciones }) {
  const navigate = useNavigate()
  const [elegidas, setElegidas] = useState(() => new Set())
  const [fecha, setFecha] = useState(hoyIso())
  const [origen, setOrigen] = useState({ cuenta: '', subcuenta: '' })
  const [descripcion, setDescripcion] = useState('')
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const todas = [...detalle.debes, ...detalle.reposiciones, ...detalle.te_deben]
  const seleccion = todas.filter((o) => elegidas.has(o.id_obligacion))
  const total = seleccion.reduce((suma, o) => suma + o.monto_pendiente, 0)
  const tipoLote = seleccion.length > 0 && seleccion.every((o) => esEntrada(o.tipo)) ? 'POR_COBRAR' : seleccion[0]?.tipo ?? 'POR_PAGAR'
  // No se mezclan las que te deben (llega dinero) con las que debes o repones (sale dinero).
  const direccion = seleccion.length ? (esEntrada(seleccion[0].tipo) ? 'entrada' : 'salida') : null
  const bloqueada = (clave) => direccion !== null && (clave === 'te_deben' ? direccion === 'salida' : direccion === 'entrada')

  const alternar = (id) => {
    setElegidas((previas) => {
      const nuevas = new Set(previas)
      if (nuevas.has(id)) nuevas.delete(id)
      else nuevas.add(id)
      return nuevas
    })
    setErrores((previos) => ({ ...previos, elegidas: undefined }))
  }
  const alternarTodas = (lista, activar) =>
    setElegidas((previas) => {
      const nuevas = new Set(previas)
      lista.forEach((o) => (activar ? nuevas.add(o.id_obligacion) : nuevas.delete(o.id_obligacion)))
      return nuevas
    })
  const cambiarOrigen = (parche) => {
    setOrigen((previo) => ({ ...previo, ...parche }))
    setErrores((previos) => ({ ...previos, cuenta: undefined }))
  }

  const enviar = async (evento) => {
    evento.preventDefault()
    const nuevos = {}
    if (seleccion.length === 0) nuevos.elegidas = 'Elige al menos una obligación.'
    if (!fecha) nuevos.fecha = 'Elige una fecha.'
    if (!origen.cuenta) nuevos.cuenta = direccion === 'entrada' ? 'Elige la cuenta que recibe el dinero.' : 'Elige la cuenta de origen.'
    setErrores(nuevos)
    setErrorGeneral(null)
    if (Object.keys(nuevos).length) return
    setGuardando(true)
    try {
      await liquidarLote({
        fecha,
        ids_obligacion: seleccion.map((o) => o.id_obligacion),
        id_cuenta_pago: Number(origen.cuenta),
        id_subcuenta_pago: origen.subcuenta ? Number(origen.subcuenta) : null,
        descripcion: descripcion.trim() || null,
      })
      navigate('/obligaciones', { state: { aviso: `${plural(seleccion.length, 'obligación liquidada', 'obligaciones liquidadas')}.` } })
    } catch (falla) {
      setErrorGeneral(falla.message)
      setGuardando(false)
    }
  }

  const hayPendientes = todas.length > 0

  return (
    <TarjetaFormulario onSubmit={enviar}>
      {!hayPendientes && <p className="field__help">No hay obligaciones pendientes para liquidar.</p>}

      {hayPendientes && (
        <div>
          <p className="field__label">Obligaciones a liquidar</p>
          <p className="field__help" style={{ margin: '0 0 8px' }}>
            Se liquida por completo lo que falta de cada una. No se mezclan las que te deben con las que debes o repones.
          </p>
          {GRUPOS.map((g) => (
            <ListaElegible
              key={g.clave}
              lista={detalle[g.clave]}
              titulo={g.titulo}
              elegidas={elegidas}
              bloqueada={bloqueada(g.clave)}
              onAlternar={alternar}
              onTodas={alternarTodas}
            />
          ))}
          {errores.elegidas && (
            <p className="field__error" role="alert">
              {errores.elegidas}
            </p>
          )}
        </div>
      )}

      <div className="pick__total">
        <span>{seleccion.length ? plural(seleccion.length, 'obligación elegida', 'obligaciones elegidas') : 'Ninguna elegida'}</span>
        <strong className="num">{dinero(total)}</strong>
      </div>

      <div className="form-divider" />

      <Campo id="fecha" etiqueta="Fecha" error={errores.fecha}>
        <InputFecha id="fecha" valor={fecha} onChange={(v) => { setFecha(v); setErrores((p) => ({ ...p, fecha: undefined })) }} error={errores.fecha} />
      </Campo>

      <OrigenLiquidacion
        tipo={direccion === 'entrada' ? 'POR_COBRAR' : tipoLote}
        cuentas={opciones.cuentas}
        valor={origen}
        alCambiar={cambiarOrigen}
        errores={errores}
        idBase="lote"
      />

      <Campo id="descripcion" etiqueta="Descripción" opcional>
        <InputTexto id="descripcion" valor={descripcion} onChange={setDescripcion} placeholder="Ej. Pago de la quincena" maxLength={100} />
      </Campo>

      <p className="field__help">
        Se registran los movimientos de cuenta y subcuenta que respaldan estas liquidaciones: las reposiciones que se saldan
        en el mismo lugar se agrupan en un solo movimiento.
      </p>

      <ErrorFormulario mensaje={errorGeneral} />

      <AccionesFormulario>
        <Link to="/obligaciones" className="btn">
          Cancelar
        </Link>
        <button type="submit" className="btn btn--primary" disabled={guardando || !hayPendientes}>
          {guardando ? 'Guardando…' : seleccion.length ? `Liquidar ${plural(seleccion.length, 'obligación', 'obligaciones')}` : 'Liquidar'}
        </button>
      </AccionesFormulario>
    </TarjetaFormulario>
  )
}

export default function LiquidarVarias() {
  const detalle = useRecurso(getObligacionesDetalle)
  const opciones = useRecurso(getOpcionesObligacion)
  const listo = detalle.data && opciones.data
  const falla = detalle.error ?? opciones.error

  return (
    <PaginaFormulario>
      <VolverA to="/obligaciones">Obligaciones</VolverA>
      <EncabezadoFormulario
        titulo="Liquidar varias obligaciones"
        subtitulo="Elige las obligaciones, la cuenta y la fecha, y se liquidan en una sola operación."
      />
      {!listo && !falla && <div className="skeleton" style={{ height: 420 }} />}
      {falla && (
        <ErrorCarga
          titulo="No se pudieron cargar los datos"
          error={falla}
          onReintentar={() => {
            detalle.recargar()
            opciones.recargar()
          }}
        />
      )}
      {listo && <Formulario detalle={detalle.data} opciones={opciones.data} />}
    </PaginaFormulario>
  )
}
