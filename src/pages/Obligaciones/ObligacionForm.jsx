import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AccionesFormulario,
  Campo,
  ErrorFormulario,
  InputFecha,
  InputMonto,
  InputTexto,
  Segmentado,
  Selector,
  TarjetaFormulario,
} from '../../components/forms'
import { TARJETA } from '../../lib/cuentas'
import { dinero, fechaCorta, hoyIso, montoParaInput, parseMonto } from '../../lib/format'
import { etiquetaTransaccion } from '../../lib/movimientos'
import { TIPOS_OBLIGACION } from '../../lib/obligaciones'
import { flujoSubcuenta } from '../Movimientos/SubmovimientosVinculados'

const texto = (id) => (id == null ? '' : String(id))
const etiquetaTrx = (t) => `${t.descripcion || etiquetaTransaccion(t.tipo)} · ${fechaCorta(t.fecha)}`
const etiquetaMov = (m) => `${flujoSubcuenta(m.tipo, m.subcuenta_origen, m.subcuenta_destino)} · ${fechaCorta(m.fecha)}`

// Las listas de "recientes" pueden no traer el vínculo actual de una obligación: se agrega para no perderlo al editar.
function conActual(lista, actual, clave) {
  return actual && !lista.some((x) => x[clave] === actual[clave]) ? [actual, ...lista] : lista
}

export default function ObligacionForm({ opciones, obligacion, personaInicial, onGuardar, onEliminar, onDeshacerLiquidacion }) {
  const editando = Boolean(obligacion)
  const [persona, setPersona] = useState(texto(obligacion?.id_persona ?? personaInicial))
  const [tipo, setTipo] = useState(obligacion?.tipo ?? 'POR_COBRAR')
  const [concepto, setConcepto] = useState(obligacion?.concepto ?? '')
  const [monto, setMonto] = useState(obligacion ? montoParaInput(obligacion.monto) : '')
  const [fecha, setFecha] = useState(obligacion?.fecha_creacion ?? hoyIso())
  const [cuenta, setCuenta] = useState(texto(obligacion?.id_cuenta_destino_resolucion))
  const [subcuenta, setSubcuenta] = useState(texto(obligacion?.id_subcuenta_destino_resolucion))
  const [trxOrigen, setTrxOrigen] = useState(texto(obligacion?.id_transaccion_origen))
  const [movOrigen, setMovOrigen] = useState(texto(obligacion?.id_movimiento_subcuenta_origen))
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const cuentaElegida = opciones.cuentas.find((c) => String(c.id_cuenta) === cuenta)
  const subcuentas = cuentaElegida && cuentaElegida.tipo !== TARJETA ? cuentaElegida.subcuentas : []
  const transacciones = conActual(opciones.transacciones_recientes, obligacion?.transaccion_origen, 'id_transaccion')
  const movimientos = conActual(
    opciones.movimientos_subcuenta_recientes,
    obligacion?.movimiento_subcuenta_origen,
    'id_movimiento_subcuenta',
  )

  const alCambiar = (campo, poner) => (valor) => {
    poner(valor)
    setErrores((previos) => ({ ...previos, [campo]: undefined }))
  }

  const validar = () => {
    const nuevos = {}
    const importe = parseMonto(monto)
    if (tipo !== 'REPOSICION' && !persona) nuevos.persona = 'Elige la persona.'
    if (!concepto.trim()) nuevos.concepto = 'Escribe el concepto.'
    if (importe == null || Number.isNaN(importe) || importe <= 0) nuevos.monto = 'Ingresa un monto mayor que 0.'
    else if (obligacion && importe < obligacion.monto_liquidado) {
      nuevos.monto = `No puede ser menor que lo ya liquidado (${dinero(obligacion.monto_liquidado)}).`
    }
    if (!fecha) nuevos.fecha = 'Elige una fecha.'
    if (!cuenta) nuevos.cuenta = 'Elige la cuenta donde se salda.'
    return nuevos
  }

  const enviar = async (evento) => {
    evento.preventDefault()
    const nuevos = validar()
    setErrores(nuevos)
    setErrorGeneral(null)
    if (Object.keys(nuevos).length) return
    setGuardando(true)
    try {
      await onGuardar({
        fecha_creacion: fecha,
        tipo,
        monto: parseMonto(monto),
        descripcion: concepto.trim(),
        id_persona: persona ? Number(persona) : null,
        id_transaccion_origen: trxOrigen ? Number(trxOrigen) : null,
        id_movimiento_subcuenta_origen: movOrigen ? Number(movOrigen) : null,
        id_cuenta_destino_resolucion: Number(cuenta),
        id_subcuenta_destino_resolucion: subcuenta ? Number(subcuenta) : null,
      })
    } catch (falla) {
      setErrorGeneral(falla.message)
      setGuardando(false)
    }
  }

  return (
    <TarjetaFormulario onSubmit={enviar}>
      <Campo id="persona" etiqueta="Persona" error={errores.persona}>
        <Selector
          id="persona"
          valor={persona}
          onChange={alCambiar('persona', setPersona)}
          vacio={tipo === 'REPOSICION' ? 'Sin persona' : 'Selecciona una persona'}
          error={errores.persona}
          opciones={opciones.personas.map((p) => ({ valor: String(p.id_persona), etiqueta: p.nombre }))}
        />
      </Campo>

      <Segmentado id="tipo" etiqueta="Tipo" opciones={TIPOS_OBLIGACION} valor={tipo} onChange={setTipo} />

      <Campo id="concepto" etiqueta="Concepto" error={errores.concepto}>
        <InputTexto
          id="concepto"
          valor={concepto}
          onChange={alCambiar('concepto', setConcepto)}
          placeholder="Ej. Préstamo personal"
          error={errores.concepto}
          maxLength={100}
          autoFocus={!editando}
        />
      </Campo>

      <div className="form-grid">
        <Campo id="monto" etiqueta="Monto" error={errores.monto}>
          <InputMonto id="monto" valor={monto} onChange={alCambiar('monto', setMonto)} error={errores.monto} />
        </Campo>
        <Campo id="fecha" etiqueta="Fecha" error={errores.fecha}>
          <InputFecha id="fecha" valor={fecha} onChange={alCambiar('fecha', setFecha)} error={errores.fecha} />
        </Campo>
      </div>

      <div className="form-divider" />

      <div>
        <p className="field__label">Dónde se salda</p>
        <p className="field__help" style={{ margin: '0 0 12px' }}>
          La cuenta (y, si quieres, la subcuenta) a la que llega o de la que sale el dinero cuando se liquide esta obligación.
        </p>
        <div className="form-grid">
          <Campo id="cuenta" etiqueta="Cuenta destino" error={errores.cuenta}>
            <Selector
              id="cuenta"
              valor={cuenta}
              onChange={(valor) => {
                setCuenta(valor)
                setSubcuenta('')
                setErrores((previos) => ({ ...previos, cuenta: undefined }))
              }}
              vacio="Selecciona una cuenta"
              error={errores.cuenta}
              opciones={opciones.cuentas.map((c) => ({
                valor: String(c.id_cuenta),
                etiqueta: [c.nombre, c.entidad].filter(Boolean).join(' · '),
              }))}
            />
          </Campo>
          <Campo id="subcuenta" etiqueta="Subcuenta destino" opcional>
            <Selector
              id="subcuenta"
              valor={subcuenta}
              onChange={setSubcuenta}
              vacio="Ninguna"
              disabled={subcuentas.length === 0}
              opciones={subcuentas.map((s) => ({ valor: String(s.id_subcuenta), etiqueta: s.nombre }))}
            />
          </Campo>
        </div>
      </div>

      <div>
        <p className="field__label">
          Movimiento de origen <span className="field__optional">(opcional)</span>
        </p>
        <p className="field__help" style={{ margin: '0 0 12px' }}>
          Si ya registraste de dónde salió el dinero de esta obligación, vincúlalo aquí.
        </p>
        <div className="form-grid">
          <Campo id="trx-origen" etiqueta="Transacción de origen">
            <Selector
              id="trx-origen"
              valor={trxOrigen}
              onChange={setTrxOrigen}
              vacio="Ninguna"
              opciones={transacciones.map((t) => ({ valor: String(t.id_transaccion), etiqueta: etiquetaTrx(t) }))}
            />
          </Campo>
          <Campo id="mov-origen" etiqueta="Movimiento de subcuenta">
            <Selector
              id="mov-origen"
              valor={movOrigen}
              onChange={setMovOrigen}
              vacio="Ninguno"
              opciones={movimientos.map((m) => ({ valor: String(m.id_movimiento_subcuenta), etiqueta: etiquetaMov(m) }))}
            />
          </Campo>
        </div>
      </div>

      {editando && obligacion.liquidaciones.length > 0 && (
        <>
          <div className="form-divider" />
          <div>
            <p className="field__label">Liquidaciones</p>
            {obligacion.liquidaciones.map((l) => (
              <div key={l.id_liquidacion} className="liq">
                <div className="liq__main">
                  <p className="liq__text num">{dinero(l.monto)}</p>
                  <p className="liq__detail">
                    {[fechaCorta(l.fecha), l.descripcion].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <button type="button" className="link-danger" onClick={() => onDeshacerLiquidacion(l)}>
                  Deshacer
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <ErrorFormulario mensaje={errorGeneral} />

      <AccionesFormulario
        izquierda={
          editando && (
            <button type="button" className="link-danger" onClick={onEliminar}>
              Eliminar obligación
            </button>
          )
        }
      >
        <Link to="/obligaciones" className="btn">
          Cancelar
        </Link>
        <button type="submit" className="btn btn--primary" disabled={guardando}>
          {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear obligación'}
        </button>
      </AccionesFormulario>
    </TarjetaFormulario>
  )
}
