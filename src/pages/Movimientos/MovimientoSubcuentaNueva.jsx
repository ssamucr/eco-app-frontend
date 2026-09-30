import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { crearMovimientoSubcuenta, getOpcionesMovimiento } from '../../api/movimientos'
import ErrorCarga from '../../components/ErrorCarga'
import {
  AccionesFormulario,
  Campo,
  EncabezadoFormulario,
  ErrorFormulario,
  InputFecha,
  PaginaFormulario,
  Selector,
  TarjetaFormulario,
  VolverA,
} from '../../components/forms'
import { useRecurso } from '../../hooks/useRecurso'
import { fechaRelativa, hoyIso } from '../../lib/format'
import { etiquetaTransaccion } from '../../lib/movimientos'
import { payloadSubmovimiento, submovimientoInicial, validarSubmovimiento } from './submovimiento'
import SubmovimientoCampos from './SubmovimientoCampos'
import './movimientos.css'

function Formulario({ opciones }) {
  const navigate = useNavigate()
  const hoy = hoyIso()
  const [valor, setValor] = useState(() => submovimientoInicial(opciones))
  const [fecha, setFecha] = useState(hoy)
  const [relacionada, setRelacionada] = useState('')
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const alCambiar = (parche) => {
    setValor((previo) => ({ ...previo, ...parche }))
    setErrores((previos) => ({ ...previos, ...Object.fromEntries(Object.keys(parche).map((k) => [k, undefined])) }))
  }

  const enviar = async (evento) => {
    evento.preventDefault()
    const nuevos = validarSubmovimiento(valor, opciones)
    if (!fecha) nuevos.fecha = 'Elige una fecha.'
    setErrores(nuevos)
    setErrorGeneral(null)
    if (Object.keys(nuevos).length) return

    setGuardando(true)
    try {
      await crearMovimientoSubcuenta({
        ...payloadSubmovimiento(valor),
        fecha,
        id_transaccion_relacionada: relacionada ? Number(relacionada) : null,
      })
      navigate('/movimientos?vista=subcuentas', { state: { aviso: 'Movimiento de subcuenta creado.' } })
    } catch (falla) {
      setErrorGeneral(falla.message)
      setGuardando(false)
    }
  }

  return (
    <TarjetaFormulario onSubmit={enviar}>
      <SubmovimientoCampos idBase="mov" opciones={opciones} valor={valor} alCambiar={alCambiar} errores={errores} />

      <Campo id="mov-fecha" etiqueta="Fecha" error={errores.fecha}>
        <InputFecha id="mov-fecha" valor={fecha} onChange={setFecha} error={errores.fecha} />
      </Campo>

      <Campo
        id="mov-relacionada"
        etiqueta="Transferencia relacionada"
        opcional
        ayuda="Úsalo si este movimiento de subcuenta viene de una transferencia ya registrada (se muestran las 60 más recientes)."
      >
        <Selector
          id="mov-relacionada"
          valor={relacionada}
          onChange={setRelacionada}
          vacio="Ninguna"
          opciones={opciones.transacciones_recientes.map((t) => ({
            valor: String(t.id_transaccion),
            etiqueta: `${t.descripcion || etiquetaTransaccion(t.tipo)} · ${fechaRelativa(t.fecha, hoy)}`,
          }))}
        />
      </Campo>

      <ErrorFormulario mensaje={errorGeneral} />

      <AccionesFormulario>
        <Link to="/movimientos" className="btn">
          Cancelar
        </Link>
        <button type="submit" className="btn btn--primary" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Crear movimiento'}
        </button>
      </AccionesFormulario>
    </TarjetaFormulario>
  )
}

export default function MovimientoSubcuentaNueva() {
  const { data: opciones, error, loading, recargar } = useRecurso(getOpcionesMovimiento)
  return (
    <PaginaFormulario>
      <VolverA to="/movimientos">Movimientos</VolverA>
      <EncabezadoFormulario
        titulo="Nuevo movimiento de subcuenta"
        subtitulo="Mueve saldo entre las subcuentas de una misma cuenta."
      />
      {loading && !opciones && <div className="skeleton" style={{ height: 460 }} />}
      {error && <ErrorCarga titulo="No se pudieron cargar los datos" error={error} onReintentar={recargar} />}
      {opciones && <Formulario opciones={opciones} />}
    </PaginaFormulario>
  )
}
