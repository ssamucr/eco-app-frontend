import { useState } from 'react'
import Icon from '../../components/Icon'
import { dinero } from '../../lib/format'
import { etiquetaSubcuenta } from '../../lib/movimientos'
import { describirSubmovimiento, payloadSubmovimiento, submovimientoInicial, validarSubmovimiento } from './submovimiento'
import SubmovimientoCampos from './SubmovimientoCampos'

export function flujoSubcuenta(tipo, origen, destino) {
  if (tipo === 'ASIGNACION' || tipo === 'REPOSICION') return `Sin asignar → ${destino}`
  if (tipo === 'GASTO') return `${origen} → gasto`
  return `${origen} → ${destino}`
}

function Fila({ tipo, texto, detalle, monto, onQuitar, nombre }) {
  return (
    <div className="linked">
      <span className="chip chip--flat">{etiquetaSubcuenta(tipo)}</span>
      <div className="linked__main">
        <p className="linked__text">{texto}</p>
        {detalle && <p className="linked__detail">{detalle}</p>}
      </div>
      <span className="linked__amount num">{dinero(monto)}</span>
      <button
        type="button"
        className="icon-btn icon-btn--xs"
        aria-label={`Quitar movimiento de subcuenta ${nombre}`}
        onClick={onQuitar}
      >
        <Icon nombre="cerrar" size={14} strokeWidth={2} />
      </button>
    </div>
  )
}

// Movimientos de subcuenta que se guardan junto con la transferencia y quedan vinculados a ella.
// `existentes` son los ya guardados (al editar): quitarlos los deshace al guardar.
export default function SubmovimientosVinculados({
  opciones,
  existentes,
  agregados,
  onAgregar,
  onQuitarExistente,
  onQuitarAgregado,
}) {
  const [abierto, setAbierto] = useState(false)
  const [valor, setValor] = useState(() => submovimientoInicial(opciones))
  const [errores, setErrores] = useState({})

  const alCambiar = (parche) => {
    setValor((previo) => ({ ...previo, ...parche }))
    setErrores((previos) => ({ ...previos, ...Object.fromEntries(Object.keys(parche).map((k) => [k, undefined])) }))
  }

  const cerrar = () => {
    setAbierto(false)
    setValor(submovimientoInicial(opciones))
    setErrores({})
  }

  const agregar = () => {
    const nuevos = validarSubmovimiento(valor, opciones)
    setErrores(nuevos)
    if (Object.keys(nuevos).length) return
    const nombres = describirSubmovimiento(valor, opciones)
    onAgregar({
      payload: payloadSubmovimiento(valor),
      tipo: valor.tipo,
      texto: flujoSubcuenta(valor.tipo, nombres.origen, nombres.destino),
      detalle: [nombres.cuenta, valor.descripcion.trim()].filter(Boolean).join(' · '),
      monto: payloadSubmovimiento(valor).monto,
    })
    cerrar()
  }

  // Enter en estos campos agrega el movimiento en vez de enviar todo el formulario.
  const alPulsar = (evento) => {
    if (evento.key === 'Enter' && evento.target.tagName !== 'BUTTON') {
      evento.preventDefault()
      agregar()
    }
  }

  return (
    <div>
      <p className="field__label">
        Movimientos entre subcuenta <span className="field__optional">(opcional)</span>
      </p>
      <p className="field__help" style={{ margin: '0 0 10px' }}>
        Si esta transferencia también mueve saldo entre subcuentas. Quedan vinculados a ella.
      </p>

      {existentes.map((m) => (
        <Fila
          key={m.id_movimiento_subcuenta}
          tipo={m.tipo}
          texto={flujoSubcuenta(m.tipo, m.subcuenta_origen, m.subcuenta_destino)}
          detalle={[m.cuenta, m.descripcion].filter(Boolean).join(' · ')}
          monto={m.monto}
          nombre={flujoSubcuenta(m.tipo, m.subcuenta_origen, m.subcuenta_destino)}
          onQuitar={() => onQuitarExistente(m.id_movimiento_subcuenta)}
        />
      ))}
      {agregados.map((a, i) => (
        <Fila
          key={`${a.texto}-${i}`}
          tipo={a.tipo}
          texto={a.texto}
          detalle={a.detalle}
          monto={a.monto}
          nombre={a.texto}
          onQuitar={() => onQuitarAgregado(i)}
        />
      ))}

      {abierto ? (
        <div className="staged-form" onKeyDown={alPulsar}>
          <SubmovimientoCampos idBase="vin" opciones={opciones} valor={valor} alCambiar={alCambiar} errores={errores} />
          <div className="staged-form__actions">
            <button type="button" className="btn" onClick={cerrar}>
              Cancelar
            </button>
            <button type="button" className="btn btn--primary" onClick={agregar}>
              Agregar
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="dashed-btn" onClick={() => setAbierto(true)}>
          <Icon nombre="agregar" size={14} strokeWidth={2} />
          Agregar movimiento de subcuenta
        </button>
      )}
    </div>
  )
}
