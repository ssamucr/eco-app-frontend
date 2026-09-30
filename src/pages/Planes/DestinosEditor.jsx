import { useState } from 'react'
import { Campo, InputMonto, InputPorcentaje, Segmentado, Selector } from '../../components/forms'
import Icon from '../../components/Icon'
import { TARJETA } from '../../lib/cuentas'
import { parseMonto } from '../../lib/format'
import { textoDestino, textoMontoDestino } from '../../lib/planes'

const VACIO = { cuenta: '', subcuenta: '', monto: '', porcentaje: '', activo: 'si' }
const ESTADOS = [
  { valor: 'si', etiqueta: 'Activo' },
  { valor: 'no', etiqueta: 'Inactivo' },
]

let contador = 0
export const nuevaClave = () => `nuevo-${(contador += 1)}`

function FilaDestino({ destino, onAlternar, onQuitar }) {
  const nombre = textoDestino(destino)
  return (
    <div className="dest">
      <button
        type="button"
        className={`dest__state ${destino.activo ? 'dest__state--on' : ''}`}
        aria-pressed={destino.activo}
        aria-label={`${destino.activo ? 'Desactivar' : 'Activar'} destino ${nombre}`}
        onClick={onAlternar}
      >
        {destino.activo ? 'Activo' : 'Inactivo'}
      </button>
      <div className="dest__main">
        <p className="dest__text">{nombre}</p>
        <p className="dest__detail">{textoMontoDestino(destino)}</p>
      </div>
      <button type="button" className="icon-btn icon-btn--xs" aria-label={`Quitar destino ${nombre}`} onClick={onQuitar}>
        <Icon nombre="cerrar" size={14} strokeWidth={2} />
      </button>
    </div>
  )
}

// Editor de la lista de destinos de un plan. `destinos` = [{ clave, id?, id_cuenta_destino, cuenta, id_subcuenta_destino,
// subcuenta, monto, porcentaje, activo }]. Los que traen `id` ya existen: solo se puede activarlos, desactivarlos o quitarlos.
// `onCambiar` recibe una función (como un setState) para que varios cambios seguidos no se pisen.
export default function DestinosEditor({ opciones, destinos, onCambiar }) {
  const [abierto, setAbierto] = useState(false)
  const [valor, setValor] = useState(VACIO)
  const [errores, setErrores] = useState({})

  const cuenta = opciones.cuentas.find((c) => String(c.id_cuenta) === valor.cuenta)
  const subcuentas = cuenta && cuenta.tipo !== TARJETA ? cuenta.subcuentas : []

  const alCambiar = (parche) => {
    setValor((previo) => ({ ...previo, ...parche }))
    setErrores((previos) => ({ ...previos, ...Object.fromEntries(Object.keys(parche).map((k) => [k, undefined])) }))
  }

  const cerrar = () => {
    setAbierto(false)
    setValor(VACIO)
    setErrores({})
  }

  const agregar = () => {
    const nuevos = {}
    const monto = parseMonto(valor.monto)
    const porcentaje = parseMonto(valor.porcentaje)
    if (!cuenta) nuevos.cuenta = 'Elige la cuenta destino.'
    if (monto != null && porcentaje != null) nuevos.monto = 'Usa un monto fijo o un porcentaje, no ambos.'
    else if (monto == null && porcentaje == null) nuevos.monto = 'Indica un monto fijo o un porcentaje.'
    else if (monto != null && (Number.isNaN(monto) || monto <= 0)) nuevos.monto = 'Ingresa un monto mayor que 0.'
    else if (porcentaje != null && (Number.isNaN(porcentaje) || porcentaje <= 0 || porcentaje > 100)) {
      nuevos.porcentaje = 'El porcentaje debe estar entre 0 y 100.'
    } else if (porcentaje != null && valor.activo === 'si') {
      const suma = destinos.filter((d) => d.activo && d.porcentaje != null).reduce((total, d) => total + d.porcentaje, 0)
      if (suma + porcentaje > 100) nuevos.porcentaje = `Con este, los porcentajes activos sumarían ${suma + porcentaje}%.`
    }
    setErrores(nuevos)
    if (Object.keys(nuevos).length) return

    const sub = subcuentas.find((s) => String(s.id_subcuenta) === valor.subcuenta)
    onCambiar((previos) => [
      ...previos,
      {
        clave: nuevaClave(),
        id: null,
        id_cuenta_destino: cuenta.id_cuenta,
        cuenta: cuenta.nombre,
        id_subcuenta_destino: sub ? sub.id_subcuenta : null,
        subcuenta: sub ? sub.nombre : null,
        monto,
        porcentaje,
        activo: valor.activo === 'si',
      },
    ])
    cerrar()
  }

  // Enter en estos campos agrega el destino en vez de enviar todo el formulario.
  const alPulsar = (evento) => {
    if (evento.key === 'Enter' && evento.target.tagName !== 'BUTTON') {
      evento.preventDefault()
      agregar()
    }
  }

  return (
    <div>
      <p className="field__label">Destinos</p>
      <p className="field__help" style={{ margin: '0 0 10px' }}>
        Cada destino mueve dinero a una cuenta (y, si quieres, a una subcuenta) cuando ejecutas el plan. Puede ser un monto
        fijo o un porcentaje del monto que distribuyas.
      </p>

      {destinos.length === 0 && !abierto && <p className="field__help dest__empty">Todavía no hay destinos.</p>}
      {destinos.map((destino) => (
        <FilaDestino
          key={destino.clave}
          destino={destino}
          onAlternar={() => onCambiar((previos) => previos.map((d) => (d === destino ? { ...d, activo: !d.activo } : d)))}
          onQuitar={() => onCambiar((previos) => previos.filter((d) => d !== destino))}
        />
      ))}

      {abierto ? (
        <div className="staged-form" onKeyDown={alPulsar}>
          <div className="form-grid">
            <Campo id="nd-cuenta" etiqueta="Cuenta destino" error={errores.cuenta}>
              <Selector
                id="nd-cuenta"
                valor={valor.cuenta}
                onChange={(cuentaElegida) => alCambiar({ cuenta: cuentaElegida, subcuenta: '' })}
                vacio="Selecciona una cuenta"
                error={errores.cuenta}
                opciones={opciones.cuentas.map((c) => ({
                  valor: String(c.id_cuenta),
                  etiqueta: [c.nombre, c.entidad].filter(Boolean).join(' · '),
                }))}
              />
            </Campo>
            <Campo id="nd-subcuenta" etiqueta="Subcuenta destino" opcional>
              <Selector
                id="nd-subcuenta"
                valor={valor.subcuenta}
                onChange={(subcuenta) => alCambiar({ subcuenta })}
                vacio="Ninguna"
                disabled={subcuentas.length === 0}
                opciones={subcuentas.map((s) => ({ valor: String(s.id_subcuenta), etiqueta: s.nombre }))}
              />
            </Campo>
          </div>

          <div className="form-grid">
            <Campo id="nd-monto" etiqueta="Monto fijo" opcional error={errores.monto}>
              <InputMonto id="nd-monto" valor={valor.monto} onChange={(monto) => alCambiar({ monto })} error={errores.monto} />
            </Campo>
            <Campo id="nd-porcentaje" etiqueta="Porcentaje" opcional error={errores.porcentaje}>
              <InputPorcentaje
                id="nd-porcentaje"
                valor={valor.porcentaje}
                onChange={(porcentaje) => alCambiar({ porcentaje })}
                error={errores.porcentaje}
              />
            </Campo>
          </div>

          <Segmentado id="nd-estado" etiqueta="Estado" opciones={ESTADOS} valor={valor.activo} onChange={(activo) => alCambiar({ activo })} />

          <div className="staged-form__actions">
            <button type="button" className="btn" onClick={cerrar}>
              Cancelar
            </button>
            <button type="button" className="btn btn--primary" onClick={agregar}>
              Agregar destino
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="dashed-btn" onClick={() => setAbierto(true)}>
          <Icon nombre="agregar" size={14} strokeWidth={2} />
          Agregar destino
        </button>
      )}
    </div>
  )
}
