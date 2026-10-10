import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { crearLiquidacion, getObligacionDetalle, getOpcionesObligacion } from '../../api/obligaciones'
import ErrorCarga from '../../components/ErrorCarga'
import {
  AccionesFormulario,
  Campo,
  EncabezadoFormulario,
  ErrorFormulario,
  InputFecha,
  InputMonto,
  InputTexto,
  PaginaFormulario,
  Segmentado,
  Selector,
  TarjetaFormulario,
  VolverA,
} from '../../components/forms'
import { useRecurso } from '../../hooks/useRecurso'
import { TARJETA } from '../../lib/cuentas'
import { dinero, dineroConSigno, fechaCorta, hoyIso, montoParaInput, parseMonto } from '../../lib/format'
import { opcionTransaccion } from '../../lib/movimientos'
import { etiquetaObligacion } from '../../lib/obligaciones'
import { flujoSubcuenta } from '../Movimientos/SubmovimientosVinculados'
import OrigenLiquidacion, { esEntrada, resumenMovimientos } from './OrigenLiquidacion'
import './obligaciones.css'

const MODOS = [
  { valor: 'generar', etiqueta: 'Generar los movimientos' },
  { valor: 'vincular', etiqueta: 'Vincular movimientos existentes' },
]

function Formulario({ obligacion: o, opciones }) {
  const navigate = useNavigate()
  const entrada = esEntrada(o.tipo)
  const [modo, setModo] = useState('generar')
  const [fecha, setFecha] = useState(hoyIso())
  const [monto, setMonto] = useState(montoParaInput(o.monto_pendiente))
  // En una obligación por cobrar el dinero llega a la cuenta donde se salda; en las demás hay que elegir de dónde sale.
  const [origen, setOrigen] = useState({
    cuenta: entrada ? String(o.id_cuenta_destino_resolucion) : '',
    subcuenta: entrada && o.id_subcuenta_destino_resolucion ? String(o.id_subcuenta_destino_resolucion) : '',
  })
  const [transaccion, setTransaccion] = useState('')
  const [movimiento, setMovimiento] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const generar = modo === 'generar'
  const alCambiar = (campo, poner) => (valor) => {
    poner(valor)
    setErrores((previos) => ({ ...previos, [campo]: undefined }))
  }
  const cambiarOrigen = (parche) => {
    setOrigen((previo) => ({ ...previo, ...parche }))
    setErrores((previos) => ({ ...previos, cuenta: undefined }))
  }

  const destinoRes = opciones.cuentas.find((c) => c.id_cuenta === o.id_cuenta_destino_resolucion)
  const resumen = generar
    ? resumenMovimientos({
        tipo: o.tipo,
        cuentas: opciones.cuentas,
        valor: origen,
        destino: { cuenta: o.cuenta_destino, subcuenta: o.subcuenta_destino, tarjeta: destinoRes?.tipo === TARJETA },
      })
    : null

  const enviar = async (evento) => {
    evento.preventDefault()
    const nuevos = {}
    const importe = parseMonto(monto)
    if (!fecha) nuevos.fecha = 'Elige una fecha.'
    if (importe == null || Number.isNaN(importe) || importe <= 0) nuevos.monto = 'Ingresa un monto mayor que 0.'
    else if (importe > o.monto_pendiente + 0.001) nuevos.monto = `Solo quedan ${dinero(o.monto_pendiente)} pendientes.`
    if (generar && !origen.cuenta) nuevos.cuenta = entrada ? 'Elige la cuenta que recibe el dinero.' : 'Elige la cuenta de origen.'
    setErrores(nuevos)
    setErrorGeneral(null)
    if (Object.keys(nuevos).length) return
    setGuardando(true)
    try {
      await crearLiquidacion({
        id_obligacion: o.id_obligacion,
        fecha,
        monto: importe,
        ...(generar
          ? {
              id_cuenta_pago: Number(origen.cuenta),
              id_subcuenta_pago: origen.subcuenta ? Number(origen.subcuenta) : null,
            }
          : {
              id_transaccion: transaccion ? Number(transaccion) : null,
              id_movimiento_subcuenta: movimiento ? Number(movimiento) : null,
            }),
        descripcion: descripcion.trim() || null,
      })
      navigate('/obligaciones', {
        state: { aviso: importe >= o.monto_pendiente - 0.001 ? 'Obligación liquidada.' : 'Liquidación parcial registrada.' },
      })
    } catch (falla) {
      setErrorGeneral(falla.message)
      setGuardando(false)
    }
  }

  return (
    <TarjetaFormulario onSubmit={enviar}>
      <div className="form-grid">
        <Campo id="fecha" etiqueta="Fecha" error={errores.fecha}>
          <InputFecha id="fecha" valor={fecha} onChange={alCambiar('fecha', setFecha)} error={errores.fecha} />
        </Campo>
        <Campo id="monto" etiqueta="Monto" error={errores.monto} ayuda={`Pendiente: ${dinero(o.monto_pendiente)}`}>
          <InputMonto id="monto" valor={monto} onChange={alCambiar('monto', setMonto)} error={errores.monto} autoFocus />
        </Campo>
      </div>

      <Segmentado id="modo-liquidacion" etiqueta="Movimientos que respaldan la liquidación" opciones={MODOS} valor={modo} onChange={setModo} />

      {generar ? (
        <>
          <OrigenLiquidacion tipo={o.tipo} cuentas={opciones.cuentas} valor={origen} alCambiar={cambiarOrigen} errores={errores} />
          {resumen && <p className="field__help">{resumen}</p>}
        </>
      ) : (
        <>
          <Campo id="transaccion" etiqueta="Transacción relacionada" opcional ayuda="La transacción con la que se saldó esta obligación.">
            <Selector
              id="transaccion"
              valor={transaccion}
              onChange={setTransaccion}
              vacio="Ninguna"
              opciones={opciones.transacciones_recientes.map(opcionTransaccion)}
            />
          </Campo>

          <Campo
            id="movimiento"
            etiqueta="Movimiento de subcuenta relacionado"
            opcional
            ayuda="El movimiento entre subcuentas con el que se saldó esta obligación, si aplica."
          >
            <Selector
              id="movimiento"
              valor={movimiento}
              onChange={setMovimiento}
              vacio="Ninguno"
              opciones={opciones.movimientos_subcuenta_recientes.map((m) => ({
                valor: String(m.id_movimiento_subcuenta),
                etiqueta: `${flujoSubcuenta(m.tipo, m.subcuenta_origen, m.subcuenta_destino)} · ${fechaCorta(m.fecha)}`,
              }))}
            />
          </Campo>
        </>
      )}

      <Campo id="descripcion" etiqueta="Descripción" opcional>
        <InputTexto
          id="descripcion"
          valor={descripcion}
          onChange={setDescripcion}
          placeholder="Ej. Carlos me devolvió el préstamo"
          maxLength={100}
        />
      </Campo>

      <ErrorFormulario mensaje={errorGeneral} />

      <AccionesFormulario>
        <Link to="/obligaciones" className="btn">
          Cancelar
        </Link>
        <button type="submit" className="btn btn--primary" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Confirmar liquidación'}
        </button>
      </AccionesFormulario>
    </TarjetaFormulario>
  )
}

export default function ObligacionLiquidar() {
  const { idObligacion } = useParams()
  const opciones = useRecurso(getOpcionesObligacion)
  const obligacion = useRecurso((o) => getObligacionDetalle(idObligacion, o), [idObligacion])
  const listo = opciones.data && obligacion.data
  const falla = opciones.error ?? obligacion.error
  const o = obligacion.data

  return (
    <PaginaFormulario>
      <VolverA to="/obligaciones">Obligaciones</VolverA>
      <EncabezadoFormulario
        titulo="Liquidar obligación"
        subtitulo={
          o ? (
            <>
              {[o.concepto, o.persona, etiquetaObligacion(o.tipo)].filter(Boolean).join(' · ')} ·{' '}
              <span className={`strong ${o.tipo === 'POR_COBRAR' ? 'positive' : o.tipo === 'POR_PAGAR' ? 'negative' : ''}`}>
                {o.tipo === 'REPOSICION' ? dinero(o.monto_pendiente) : dineroConSigno(o.tipo === 'POR_PAGAR' ? -o.monto_pendiente : o.monto_pendiente)}
              </span>
            </>
          ) : (
            ' '
          )
        }
      />
      {!listo && !falla && <div className="skeleton" style={{ height: 420 }} />}
      {falla && (
        <ErrorCarga
          titulo="No se pudo cargar la obligación"
          error={falla}
          onReintentar={() => {
            opciones.recargar()
            obligacion.recargar()
          }}
        />
      )}
      {listo && o.resuelta && (
        <p className="form-error" role="alert">
          Esta obligación ya está liquidada por completo.
        </p>
      )}
      {listo && !o.resuelta && <Formulario obligacion={o} opciones={opciones.data} />}
    </PaginaFormulario>
  )
}
