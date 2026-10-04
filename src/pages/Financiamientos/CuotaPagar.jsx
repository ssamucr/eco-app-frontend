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
  Segmentado,
  Selector,
  TarjetaFormulario,
  VolverA,
} from '../../components/forms'
import { useRecurso } from '../../hooks/useRecurso'
import { TARJETA } from '../../lib/cuentas'
import { dinero, fechaCorta, hoyIso, montoParaInput, parseMonto } from '../../lib/format'
import { opcionTransaccion } from '../../lib/movimientos'
import './financiamientos.css'

const MODOS = [
  { valor: 'generar', etiqueta: 'Generar el pago' },
  { valor: 'vincular', etiqueta: 'Vincular un pago ya registrado' },
]

function Formulario({ cuota: q, opciones }) {
  const navigate = useNavigate()
  const [modo, setModo] = useState('generar')
  const [fecha, setFecha] = useState(hoyIso())
  const [monto, setMonto] = useState(montoParaInput(q.monto))
  const [cuenta, setCuenta] = useState('')
  const [subcuenta, setSubcuenta] = useState('')
  const [tarjeta, setTarjeta] = useState('')
  const [transaccion, setTransaccion] = useState('')
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const alCambiar = (campo, poner) => (valor) => {
    poner(valor)
    setErrores((previos) => ({ ...previos, [campo]: undefined }))
  }

  const cuentasPago = opciones.cuentas.filter((c) => c.tipo !== TARJETA)
  const tarjetas = opciones.cuentas.filter((c) => c.tipo === TARJETA)
  const cuentaElegida = cuentasPago.find((c) => String(c.id_cuenta) === cuenta)
  const subcuentas = cuentaElegida?.subcuentas ?? []
  const generar = modo === 'generar'
  const sinAsignar = cuentaElegida ? Math.max(cuentaElegida.sin_asignar, 0) : null

  const enviar = async (evento) => {
    evento.preventDefault()
    const nuevos = {}
    const importe = parseMonto(monto)
    if (!fecha) nuevos.fecha = 'Elige la fecha de pago.'
    if (importe == null || Number.isNaN(importe) || importe <= 0) nuevos.monto = 'Ingresa un monto mayor que 0.'
    if (generar) {
      if (!cuenta) nuevos.cuenta = 'Elige la cuenta desde la que pagas.'
      if (!q.id_tarjeta && !tarjeta) nuevos.tarjeta = 'Elige la tarjeta que pagas.'
    }
    setErrores(nuevos)
    setErrorGeneral(null)
    if (Object.keys(nuevos).length) return
    setGuardando(true)
    try {
      await pagarCuota(q.id_cuota_financiamiento, {
        fecha_pago: fecha,
        monto: importe,
        ...(generar
          ? {
              id_cuenta_origen: Number(cuenta),
              id_subcuenta_origen: subcuenta ? Number(subcuenta) : null,
              id_tarjeta: !q.id_tarjeta && tarjeta ? Number(tarjeta) : null,
            }
          : { id_transaccion_pago: transaccion ? Number(transaccion) : null }),
      })
      navigate(`/financiamientos/${q.id_financiamiento}/editar`, { state: { aviso: `Cuota ${q.numero_cuota} pagada.` } })
    } catch (falla) {
      setErrorGeneral(falla.message)
      setGuardando(false)
    }
  }

  return (
    <TarjetaFormulario onSubmit={enviar}>
      <Segmentado id="modo-pago" etiqueta="Pago" opciones={MODOS} valor={modo} onChange={setModo} />

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

      {generar ? (
        <>
          <div className="info-box">
            <span className="info-box__label">Tarjeta que se paga</span>
            <span className="info-box__value">{q.tarjeta ?? 'Sin definir'}</span>
          </div>
          {!q.id_tarjeta && (
            <Campo
              id="tarjeta"
              etiqueta="Tarjeta"
              error={errores.tarjeta}
              ayuda="Este financiamiento no tiene una compra de origen, así que elige la tarjeta."
            >
              <Selector
                id="tarjeta"
                valor={tarjeta}
                onChange={alCambiar('tarjeta', setTarjeta)}
                vacio="Selecciona una tarjeta"
                error={errores.tarjeta}
                opciones={tarjetas.map((c) => ({ valor: String(c.id_cuenta), etiqueta: [c.nombre, c.entidad].filter(Boolean).join(' · ') }))}
              />
            </Campo>
          )}
          <Campo
            id="cuenta"
            etiqueta="Pagar desde la cuenta"
            error={errores.cuenta}
            ayuda={sinAsignar != null ? `Sin asignar en esta cuenta: ${dinero(sinAsignar)}` : undefined}
          >
            <Selector
              id="cuenta"
              valor={cuenta}
              onChange={(id) => {
                alCambiar('cuenta', setCuenta)(id)
                setSubcuenta('')
              }}
              vacio="Selecciona una cuenta"
              error={errores.cuenta}
              opciones={cuentasPago.map((c) => ({
                valor: String(c.id_cuenta),
                etiqueta: [c.nombre, c.entidad].filter(Boolean).join(' · '),
                detalle: `Saldo ${dinero(c.saldo)}`,
              }))}
            />
          </Campo>
          <Campo
            id="subcuenta"
            etiqueta="Tomar de la subcuenta"
            opcional
            ayuda="Si el dinero está reservado en una subcuenta, se descuenta de ella con este pago."
          >
            <Selector
              id="subcuenta"
              valor={subcuenta}
              onChange={setSubcuenta}
              vacio="Ninguna (del saldo sin asignar)"
              disabled={subcuentas.length === 0}
              opciones={subcuentas.map((s) => ({ valor: String(s.id_subcuenta), etiqueta: s.nombre, detalle: dinero(s.saldo) }))}
            />
          </Campo>
          <p className="field__help">
            Se registra un pago a tarjeta por este monto y la cuota queda vinculada a él.
          </p>
        </>
      ) : (
        <Campo id="transaccion" etiqueta="Transacción de pago" opcional ayuda="La transacción con la que pagaste esta cuota.">
          <Selector
            id="transaccion"
            valor={transaccion}
            onChange={setTransaccion}
            vacio="Ninguna"
            opciones={opciones.transacciones_recientes.map(opcionTransaccion)}
          />
        </Campo>
      )}

      <ErrorFormulario mensaje={errorGeneral} />

      <AccionesFormulario>
        <Link to={`/financiamientos/${q.id_financiamiento}/editar`} className="btn">
          Cancelar
        </Link>
        <button type="submit" className="btn btn--primary" disabled={guardando}>
          {guardando ? 'Guardando…' : generar ? 'Pagar cuota' : 'Confirmar pago'}
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
