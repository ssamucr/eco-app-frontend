import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getCuotaDetalle, getOpcionesFinanciamiento, pagarCuota } from '../../api/financiamientos'
import ErrorCarga from '../../components/ErrorCarga'
import {
  AccionesFormulario,
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
import { dinero, fechaCorta, hoyIso, montoParaInput, parseMonto } from '../../lib/format'
import { etiquetaTransaccion } from '../../lib/movimientos'
import './financiamientos.css'

function Formulario({ cuota: q, opciones }) {
  const navigate = useNavigate()
  const [fecha, setFecha] = useState(hoyIso())
  const [monto, setMonto] = useState(montoParaInput(q.monto))
  const [transaccion, setTransaccion] = useState('')
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const alCambiar = (campo, poner) => (valor) => {
    poner(valor)
    setErrores((previos) => ({ ...previos, [campo]: undefined }))
  }

  const enviar = async (evento) => {
    evento.preventDefault()
    const nuevos = {}
    const importe = parseMonto(monto)
    if (!fecha) nuevos.fecha = 'Elige la fecha de pago.'
    if (importe == null || Number.isNaN(importe) || importe <= 0) nuevos.monto = 'Ingresa un monto mayor que 0.'
    setErrores(nuevos)
    setErrorGeneral(null)
    if (Object.keys(nuevos).length) return
    setGuardando(true)
    try {
      await pagarCuota(q.id_cuota_financiamiento, {
        fecha_pago: fecha,
        monto: importe,
        id_transaccion_pago: transaccion ? Number(transaccion) : null,
      })
      navigate(`/financiamientos/${q.id_financiamiento}/editar`, { state: { aviso: `Cuota ${q.numero_cuota} pagada.` } })
    } catch (falla) {
      setErrorGeneral(falla.message)
      setGuardando(false)
    }
  }

  return (
    <TarjetaFormulario onSubmit={enviar}>
      <div className="form-grid">
        <Campo id="fecha" etiqueta="Fecha de pago" error={errores.fecha}>
          <InputFecha id="fecha" valor={fecha} onChange={alCambiar('fecha', setFecha)} error={errores.fecha} />
        </Campo>
        <Campo
          id="monto"
          etiqueta="Monto"
          error={errores.monto}
          ayuda="Si pagas un monto distinto, la cuota queda con lo que pagaste."
        >
          <InputMonto id="monto" valor={monto} onChange={alCambiar('monto', setMonto)} error={errores.monto} autoFocus />
        </Campo>
      </div>

      <Campo id="transaccion" etiqueta="Transacción de pago" opcional ayuda="La transacción con la que pagaste esta cuota.">
        <Selector
          id="transaccion"
          valor={transaccion}
          onChange={setTransaccion}
          vacio="Ninguna"
          opciones={opciones.transacciones_recientes.map((t) => ({
            valor: String(t.id_transaccion),
            etiqueta: `${t.descripcion || etiquetaTransaccion(t.tipo)} · ${fechaCorta(t.fecha)}`,
          }))}
        />
      </Campo>

      <ErrorFormulario mensaje={errorGeneral} />

      <AccionesFormulario>
        <Link to={`/financiamientos/${q.id_financiamiento}/editar`} className="btn">
          Cancelar
        </Link>
        <button type="submit" className="btn btn--primary" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Confirmar pago'}
        </button>
      </AccionesFormulario>
    </TarjetaFormulario>
  )
}

export default function CuotaPagar() {
  const { idCuota } = useParams()
  const opciones = useRecurso(getOpcionesFinanciamiento)
  const cuota = useRecurso((o) => getCuotaDetalle(idCuota, o), [idCuota])
  const listo = opciones.data && cuota.data
  const falla = opciones.error ?? cuota.error
  const q = cuota.data

  return (
    <PaginaFormulario>
      <VolverA to={q ? `/financiamientos/${q.id_financiamiento}/editar` : '/financiamientos'}>Financiamiento</VolverA>
      <EncabezadoFormulario
        titulo="Pagar cuota"
        subtitulo={
          q ? (
            <>
              {q.financiamiento} · Cuota {q.numero_cuota} de {q.numero_cuotas} · <span className="strong">{dinero(q.monto)}</span>
            </>
          ) : (
            ' '
          )
        }
      />
      {!listo && !falla && <div className="skeleton" style={{ height: 320 }} />}
      {falla && (
        <ErrorCarga
          titulo="No se pudo cargar la cuota"
          error={falla}
          onReintentar={() => {
            opciones.recargar()
            cuota.recargar()
          }}
        />
      )}
      {listo && q.pagada && (
        <p className="form-error" role="alert">
          Esta cuota ya está pagada (el {fechaCorta(q.fecha_pago)}). Puedes deshacer el pago desde su edición.
        </p>
      )}
      {listo && !q.pagada && <Formulario cuota={q} opciones={opciones.data} />}
    </PaginaFormulario>
  )
}
