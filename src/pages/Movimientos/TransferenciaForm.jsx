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
import { hoyIso, montoParaInput, parseMonto } from '../../lib/format'
import { TIPOS_TRANSACCION, transaccionTieneDestino, transaccionTieneOrigen } from '../../lib/movimientos'
import { ajustesSinAsignar, efectoSinAsignar } from './submovimiento'
import ObligacionDelGasto, { OBLIGACION_VACIA } from './ObligacionDelGasto'
import SubmovimientosVinculados from './SubmovimientosVinculados'

const usaOrigen = transaccionTieneOrigen
const usaDestino = transaccionTieneDestino

const ETIQUETA_ENVIAR = {
  TRANSFERENCIA: 'Crear transferencia',
  PAGO_TARJETA: 'Registrar pago',
  GASTO: 'Registrar gasto',
  INGRESO: 'Registrar ingreso',
}

const texto = (id) => (id == null ? '' : String(id))

export default function TransferenciaForm({ opciones, movimiento, tipoInicial, onGuardar, onEliminar }) {
  const editando = Boolean(movimiento)
  const [tipo, setTipo] = useState(movimiento?.tipo ?? tipoInicial)
  const [origen, setOrigen] = useState(texto(movimiento?.id_cuenta_origen))
  const [destino, setDestino] = useState(texto(movimiento?.id_cuenta_destino))
  const [categoria, setCategoria] = useState(texto(movimiento?.id_categoria))
  const [monto, setMonto] = useState(movimiento ? montoParaInput(movimiento.monto) : '')
  const [fecha, setFecha] = useState(movimiento?.fecha ?? hoyIso())
  const [descripcion, setDescripcion] = useState(movimiento?.descripcion ?? '')
  const [referencia, setReferencia] = useState(movimiento?.referencia ?? '')
  const [quitados, setQuitados] = useState([])
  const [agregados, setAgregados] = useState([])
  const [obligacion, setObligacion] = useState(OBLIGACION_VACIA)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [guardando, setGuardando] = useState(false)

  // Cuánto cambia "sin asignar" de cada cuenta por esta transacción, comparado con lo que ya
  // reflejan los datos cargados (el movimiento original, si se está editando uno existente).
  const efectoActual = efectoSinAsignar(tipo, origen, destino, parseMonto(monto) || 0)
  const efectoOriginal = editando
    ? efectoSinAsignar(movimiento.tipo, texto(movimiento.id_cuenta_origen), texto(movimiento.id_cuenta_destino), Number(movimiento.monto))
    : {}
  const ajustes = ajustesSinAsignar(efectoActual, efectoOriginal)

  const cuentaPorId = (id) => opciones.cuentas.find((c) => String(c.id_cuenta) === id)
  const opcionesCuenta = (cuentas) =>
    cuentas.map((c) => ({ valor: String(c.id_cuenta), etiqueta: [c.nombre, c.entidad].filter(Boolean).join(' · ') }))
  const tarjetas = opciones.cuentas.filter((c) => c.tipo === TARJETA)
  const noTarjetas = opciones.cuentas.filter((c) => c.tipo !== TARJETA)

  // Al editar un campo se quita su error, para no dejar mensajes obsoletos.
  const alCambiar = (campo, poner) => (valor) => {
    poner(valor)
    setErrores((previos) => ({ ...previos, [campo]: undefined }))
  }

  const cambiarTipo = (nuevo) => {
    setTipo(nuevo)
    setErrores({})
    // Un pago a tarjeta va de una cuenta a una tarjeta.
    if (nuevo === 'PAGO_TARJETA') {
      if (cuentaPorId(destino)?.tipo !== TARJETA) setDestino('')
      if (cuentaPorId(origen)?.tipo === TARJETA) setOrigen('')
    }
  }

  // Un gasto con la tarjeta puede dejar una obligación (alguien debe esa compra); un gasto de una cuenta ya salió del dinero.
  const ofreceObligacion = !editando && tipo === 'GASTO' && cuentaPorId(origen)?.tipo === TARJETA
  const cambiarObligacion = (parche) => {
    setObligacion((previa) => ({ ...previa, ...parche }))
    setErrores((previos) => ({ ...previos, oblPersona: undefined, oblCuenta: undefined, oblMonto: undefined }))
  }

  const validar = () => {
    const nuevos = {}
    const importe = parseMonto(monto)
    if (tipo !== 'INGRESO' && tipo !== 'PAGO_TARJETA' && !origen) nuevos.origen = 'Elige la cuenta origen.'
    if (usaDestino(tipo) && !destino) nuevos.destino = 'Elige la cuenta destino.'
    if (tipo === 'TRANSFERENCIA' && origen && origen === destino) nuevos.destino = 'Debe ser distinta a la cuenta origen.'
    if (importe == null || Number.isNaN(importe) || importe <= 0) nuevos.monto = 'Ingresa un monto mayor que 0.'
    if (!fecha) nuevos.fecha = 'Elige una fecha.'
    if (ofreceObligacion && obligacion.activa) {
      const importeObl = parseMonto(obligacion.monto)
      if (obligacion.tipo !== 'REPOSICION' && !obligacion.persona) nuevos.oblPersona = 'Elige la persona.'
      if (!obligacion.cuenta) nuevos.oblCuenta = 'Elige la cuenta donde se salda.'
      if (Number.isNaN(importeObl) || (importeObl != null && importeObl <= 0)) nuevos.oblMonto = 'Ingresa un monto mayor que 0.'
    }
    return nuevos
  }

  const enviar = async (evento) => {
    evento.preventDefault()
    const nuevos = validar()
    setErrores(nuevos)
    setErrorGeneral(null)
    if (Object.keys(nuevos).length) return

    const cuerpo = {
      tipo,
      fecha,
      monto: parseMonto(monto),
      id_cuenta_origen: usaOrigen(tipo) && origen ? Number(origen) : null,
      id_cuenta_destino: usaDestino(tipo) ? Number(destino) : null,
      id_categoria: categoria ? Number(categoria) : null,
      descripcion: descripcion.trim() || null,
      referencia: referencia.trim() || null,
    }
    const nuevosMovimientos = agregados.map((a) => a.payload)
    if (editando) {
      cuerpo.agregar_movimientos_subcuenta = nuevosMovimientos
      cuerpo.quitar_movimientos_subcuenta = quitados
    } else {
      cuerpo.movimientos_subcuenta = nuevosMovimientos
      if (ofreceObligacion && obligacion.activa) {
        cuerpo.obligacion = {
          tipo: obligacion.tipo,
          id_persona: obligacion.persona ? Number(obligacion.persona) : null,
          descripcion: obligacion.concepto.trim() || null,
          monto: parseMonto(obligacion.monto),
          id_cuenta_destino_resolucion: Number(obligacion.cuenta),
          id_subcuenta_destino_resolucion: obligacion.subcuenta ? Number(obligacion.subcuenta) : null,
        }
      }
    }

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
      <Segmentado id="tipo" etiqueta="Tipo de movimiento" opciones={TIPOS_TRANSACCION} valor={tipo} onChange={cambiarTipo} />

      {usaOrigen(tipo) && (
        <Campo id="origen" etiqueta="Cuenta origen" error={errores.origen}>
          <Selector
            id="origen"
            valor={origen}
            onChange={alCambiar('origen', setOrigen)}
            vacio={tipo === 'PAGO_TARJETA' ? 'Sin cuenta de origen' : 'Selecciona una cuenta'}
            opciones={opcionesCuenta(tipo === 'PAGO_TARJETA' ? noTarjetas : opciones.cuentas)}
            error={errores.origen}
          />
        </Campo>
      )}

      {usaDestino(tipo) && (
        <Campo
          id="destino"
          etiqueta={
            tipo === 'INGRESO' ? 'Cuenta destino' : tipo === 'PAGO_TARJETA' ? 'Tarjeta destino' : 'Cuenta o tarjeta destino'
          }
          error={errores.destino}
        >
          <Selector
            id="destino"
            valor={destino}
            onChange={alCambiar('destino', setDestino)}
            vacio={tipo === 'PAGO_TARJETA' ? 'Selecciona una tarjeta' : 'Selecciona una cuenta'}
            opciones={opcionesCuenta(tipo === 'PAGO_TARJETA' ? tarjetas : opciones.cuentas)}
            error={errores.destino}
          />
        </Campo>
      )}

      <Campo id="categoria" etiqueta="Categoría" opcional>
        <Selector
          id="categoria"
          valor={categoria}
          onChange={setCategoria}
          vacio="Sin categoría"
          opciones={opciones.categorias.map((c) => ({ valor: String(c.id_categoria), etiqueta: c.nombre }))}
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

      <Campo id="descripcion" etiqueta="Descripción" opcional>
        <InputTexto
          id="descripcion"
          valor={descripcion}
          onChange={setDescripcion}
          placeholder="Ej. Almuerzo, transferencia interna..."
          maxLength={100}
        />
      </Campo>

      <Campo id="referencia" etiqueta="Referencia" opcional>
        <InputTexto
          id="referencia"
          valor={referencia}
          onChange={setReferencia}
          placeholder="Ej. Núm. de comprobante o cheque"
          maxLength={30}
        />
      </Campo>

      {ofreceObligacion && (
        <>
          <div className="form-divider" />
          <ObligacionDelGasto
            opciones={opciones}
            valor={obligacion}
            alCambiar={cambiarObligacion}
            errores={errores}
            montoGasto={parseMonto(monto)}
            descripcionGasto={descripcion.trim()}
          />
        </>
      )}

      <div className="form-divider" />

      <SubmovimientosVinculados
        opciones={opciones}
        existentes={(movimiento?.movimientos_subcuenta ?? []).filter((m) => !quitados.includes(m.id_movimiento_subcuenta))}
        agregados={agregados}
        onAgregar={(nuevo) => setAgregados([...agregados, nuevo])}
        onQuitarExistente={(id) => setQuitados([...quitados, id])}
        onQuitarAgregado={(indice) => setAgregados(agregados.filter((_, i) => i !== indice))}
        ajustes={ajustes}
      />

      <ErrorFormulario mensaje={errorGeneral} />

      <AccionesFormulario
        izquierda={
          editando && (
            <button type="button" className="link-danger" onClick={onEliminar}>
              Eliminar movimiento
            </button>
          )
        }
      >
        <Link to="/movimientos" className="btn">
          Cancelar
        </Link>
        <button type="submit" className="btn btn--primary" disabled={guardando}>
          {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : ETIQUETA_ENVIAR[tipo]}
        </button>
      </AccionesFormulario>
    </TarjetaFormulario>
  )
}
