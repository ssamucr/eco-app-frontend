import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AccionesFormulario,
  Campo,
  ErrorFormulario,
  InputFecha,
  InputMonto,
  InputTexto,
  Selector,
  TarjetaFormulario,
} from '../../components/forms'
import Icon from '../../components/Icon'
import { fechaCorta, montoParaInput, parseMonto } from '../../lib/format'

// Sirve para crear (cuota = null) y para editar una cuota. `financiamientos` = los que se pueden elegir.
export default function CuotaForm({
  financiamientos,
  financiamientoInicial,
  numeroSugerido,
  cuota,
  onGuardar,
  onEliminar,
  onDeshacerPago,
}) {
  const editando = Boolean(cuota)
  const [financiamiento, setFinanciamiento] = useState(String(cuota?.id_financiamiento ?? financiamientoInicial ?? ''))
  const [numero, setNumero] = useState(cuota ? String(cuota.numero_cuota) : numeroSugerido ? String(numeroSugerido) : '')
  const [monto, setMonto] = useState(cuota ? montoParaInput(cuota.monto) : '')
  const [vencimiento, setVencimiento] = useState(cuota?.fecha_vencimiento ?? '')
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
    if (!financiamiento) nuevos.financiamiento = 'Elige el financiamiento.'
    if (!/^\d+$/.test(numero.trim()) || Number(numero) < 1) nuevos.numero = 'Ingresa un número de cuota (1 o mayor).'
    if (importe == null || Number.isNaN(importe) || importe <= 0) nuevos.monto = 'Ingresa un monto mayor que 0.'
    if (!vencimiento) nuevos.vencimiento = 'Elige la fecha de vencimiento.'
    setErrores(nuevos)
    setErrorGeneral(null)
    if (Object.keys(nuevos).length) return
    setGuardando(true)
    try {
      await onGuardar({
        id_financiamiento: Number(financiamiento),
        numero_cuota: Number(numero),
        fecha_vencimiento: vencimiento,
        monto: importe,
      })
    } catch (falla) {
      setErrorGeneral(falla.message)
      setGuardando(false)
    }
  }

  return (
    <TarjetaFormulario onSubmit={enviar}>
      <Campo id="financiamiento" etiqueta="Financiamiento" error={errores.financiamiento}>
        <Selector
          id="financiamiento"
          valor={financiamiento}
          onChange={alCambiar('financiamiento', setFinanciamiento)}
          vacio="Selecciona un financiamiento"
          error={errores.financiamiento}
          opciones={financiamientos.map((f) => ({
            valor: String(f.id_financiamiento),
            etiqueta: [f.descripcion, f.tarjeta].filter(Boolean).join(' · '),
          }))}
        />
      </Campo>

      <div className="form-grid">
        <Campo id="numero" etiqueta="Número de cuota" error={errores.numero}>
          <InputTexto
            id="numero"
            valor={numero}
            onChange={alCambiar('numero', setNumero)}
            inputMode="numeric"
            placeholder="Ej. 13"
            error={errores.numero}
            maxLength={4}
          />
        </Campo>
        <Campo id="monto" etiqueta="Monto" error={errores.monto}>
          <InputMonto id="monto" valor={monto} onChange={alCambiar('monto', setMonto)} error={errores.monto} />
        </Campo>
      </div>

      <Campo
        id="vencimiento"
        etiqueta="Fecha de vencimiento"
        error={errores.vencimiento}
        ayuda={editando ? undefined : 'La cuota se crea como pendiente. Se paga después desde el calendario del financiamiento.'}
      >
        <InputFecha id="vencimiento" valor={vencimiento} onChange={alCambiar('vencimiento', setVencimiento)} error={errores.vencimiento} />
      </Campo>

      {editando && (
        <>
          <div className="form-divider" />
          <div>
            <p className="field__label">Estado de pago</p>
            {cuota.pagada ? (
              <div className="paybox paybox--paid">
                <div className="quota__state quota__state--paid">
                  <Icon nombre="check" size={14} strokeWidth={2.2} />
                </div>
                <div className="paybox__main">
                  <p className="paybox__title">Pagada el {fechaCorta(cuota.fecha_pago)}</p>
                  {cuota.id_transaccion_pago && (
                    <p className="paybox__meta">
                      Transacción: {cuota.transaccion_pago || 'sin descripción'}
                      {cuota.fecha_transaccion_pago && ` · ${fechaCorta(cuota.fecha_transaccion_pago)}`}
                    </p>
                  )}
                </div>
                <button type="button" className="link-danger link-danger--muted" onClick={onDeshacerPago}>
                  Deshacer pago
                </button>
              </div>
            ) : (
              <div className="paybox">
                <div className="quota__state">
                  <Icon nombre="reloj" size={14} strokeWidth={2} />
                </div>
                <div className="paybox__main">
                  <p className="paybox__title">Pendiente</p>
                </div>
                <Link to={`/cuotas-financiamiento/${cuota.id_cuota_financiamiento}/pagar`} className="btn btn--small">
                  Pagar
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      <ErrorFormulario mensaje={errorGeneral} />

      <AccionesFormulario
        izquierda={
          editando && (
            <button type="button" className="link-danger" onClick={onEliminar}>
              Eliminar cuota
            </button>
          )
        }
      >
        <Link to="/financiamientos" className="btn">
          Cancelar
        </Link>
        <button type="submit" className="btn btn--primary" disabled={guardando}>
          {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear cuota'}
        </button>
      </AccionesFormulario>
    </TarjetaFormulario>
  )
}
