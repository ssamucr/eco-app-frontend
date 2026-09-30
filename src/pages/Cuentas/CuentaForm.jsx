import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AccionesFormulario,
  Campo,
  ErrorFormulario,
  InputMonto,
  InputTexto,
  Segmentado,
  TarjetaFormulario,
} from '../../components/forms'
import Icon from '../../components/Icon'
import { TARJETA, TIPOS_CUENTA, colorSubcuenta } from '../../lib/cuentas'
import { dinero, montoParaInput, parseMonto } from '../../lib/format'
import SubcuentasFilas from './SubcuentasFilas'

const SUBCUENTA_VACIA = { nombre: '', monto: '', meta: '' }

// Subcuentas que se crean junto con la cuenta (solo en el alta).
function SubcuentasIniciales({ subcuentas, saldo, onAgregar, onQuitar }) {
  const [abierto, setAbierto] = useState(false)
  const [borrador, setBorrador] = useState(SUBCUENTA_VACIA)
  const [errores, setErrores] = useState({})

  const asignado = subcuentas.reduce((suma, s) => suma + s.monto, 0)
  const libre = Math.max(saldo, 0) - asignado

  const cerrar = () => {
    setAbierto(false)
    setBorrador(SUBCUENTA_VACIA)
    setErrores({})
  }

  const agregar = () => {
    const nuevos = {}
    const monto = parseMonto(borrador.monto)
    const meta = parseMonto(borrador.meta)
    if (!borrador.nombre.trim()) nuevos.nombre = 'Escribe un nombre.'
    if (Number.isNaN(monto) || (monto ?? 0) < 0) nuevos.monto = 'Ingresa un monto válido.'
    else if ((monto ?? 0) > libre + 0.001) nuevos.monto = `Solo quedan ${dinero(libre)} sin asignar.`
    if (Number.isNaN(meta) || (meta ?? 0) < 0) nuevos.meta = 'Ingresa un monto válido.'
    setErrores(nuevos)
    if (Object.keys(nuevos).length) return
    onAgregar({ nombre: borrador.nombre.trim(), monto: monto ?? 0, saldo_meta: meta })
    cerrar()
  }

  // Enter en estos campos agrega la subcuenta en vez de enviar todo el formulario.
  const alPulsar = (evento) => {
    if (evento.key === 'Enter') {
      evento.preventDefault()
      agregar()
    }
  }

  return (
    <div>
      <p className="field__label">
        Subcuentas <span className="field__optional">(opcional)</span>
      </p>
      <p className="field__help" style={{ margin: '0 0 10px' }}>
        Divide el saldo de esta cuenta en metas específicas. Se crean junto con la cuenta.
      </p>

      {subcuentas.map((s, i) => (
        <div key={`${s.nombre}-${i}`} className="staged">
          <span className="dot" style={{ background: colorSubcuenta(i) }} />
          <div className="staged__main">
            <p className="staged__name">{s.nombre}</p>
            {s.saldo_meta != null && <p className="staged__meta">Meta {dinero(s.saldo_meta)}</p>}
          </div>
          <span className="staged__amount num">{dinero(s.monto)}</span>
          <button
            type="button"
            className="icon-btn icon-btn--xs"
            aria-label={`Quitar subcuenta ${s.nombre}`}
            onClick={() => onQuitar(i)}
          >
            <Icon nombre="cerrar" size={14} strokeWidth={2} />
          </button>
        </div>
      ))}

      {abierto ? (
        <div className="staged-form" onKeyDown={alPulsar}>
          <Campo id="sub-nombre" etiqueta="Nombre de la subcuenta" error={errores.nombre}>
            <InputTexto
              id="sub-nombre"
              valor={borrador.nombre}
              onChange={(nombre) => setBorrador({ ...borrador, nombre })}
              placeholder="Ej. Fondo de emergencia"
              error={errores.nombre}
              autoFocus
            />
          </Campo>
          <div className="staged-form__row">
            <Campo id="sub-monto" etiqueta="Monto a asignar" error={errores.monto} ayuda={`Sin asignar: ${dinero(libre)}`}>
              <InputMonto
                id="sub-monto"
                valor={borrador.monto}
                onChange={(monto) => setBorrador({ ...borrador, monto })}
                error={errores.monto}
              />
            </Campo>
            <Campo id="sub-meta" etiqueta="Saldo meta" opcional error={errores.meta}>
              <InputMonto
                id="sub-meta"
                valor={borrador.meta}
                onChange={(meta) => setBorrador({ ...borrador, meta })}
                error={errores.meta}
              />
            </Campo>
          </div>
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
          Agregar subcuenta
        </button>
      )}
    </div>
  )
}

// Subcuentas ya existentes de la cuenta (solo al editar).
function SubcuentasExistentes({ cuenta, onEliminarSubcuenta }) {
  return (
    <div>
      <p className="field__label">Subcuentas</p>
      {cuenta.subcuentas.length === 0 && <p className="field__help">Sin subcuentas todavía.</p>}
      <SubcuentasFilas cuenta={cuenta} onEliminar={onEliminarSubcuenta} />
      <div style={{ marginTop: 6 }}>
        <Link to={`/cuentas/${cuenta.id_cuenta}/subcuentas/nueva`} className="dashed-btn">
          <Icon nombre="agregar" size={14} strokeWidth={2} />
          Agregar subcuenta
        </Link>
      </div>
    </div>
  )
}

export default function CuentaForm({ cuenta, onGuardar, onEliminar, onEliminarSubcuenta }) {
  const editando = Boolean(cuenta)
  const [nombre, setNombre] = useState(cuenta?.nombre ?? '')
  const [entidad, setEntidad] = useState(cuenta?.entidad ?? '')
  const [tipo, setTipo] = useState(cuenta?.tipo ?? 'AHORRO')
  const [saldoInicial, setSaldoInicial] = useState('')
  const [limite, setLimite] = useState(montoParaInput(cuenta?.limite_credito))
  const [subcuentas, setSubcuentas] = useState([])
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const esTarjeta = tipo === TARJETA
  const saldo = parseMonto(saldoInicial)

  // Al editar un campo se quita su error, para no dejar mensajes obsoletos.
  const alCambiar = (campo, poner) => (valor) => {
    poner(valor)
    setErrores((previos) => ({ ...previos, [campo]: undefined }))
  }

  const validar = () => {
    const nuevos = {}
    if (!nombre.trim()) nuevos.nombre = 'Escribe un nombre para la cuenta.'
    if (esTarjeta) {
      const valor = parseMonto(limite)
      if (valor == null || Number.isNaN(valor) || valor <= 0) nuevos.limite = 'Ingresa un límite de crédito mayor que 0.'
    }
    if (!editando && Number.isNaN(saldo)) nuevos.saldo = 'Ingresa un monto válido.'
    return nuevos
  }

  const enviar = async (evento) => {
    evento.preventDefault()
    const nuevos = validar()
    setErrores(nuevos)
    setErrorGeneral(null)
    if (Object.keys(nuevos).length) return

    const cuerpo = {
      nombre: nombre.trim(),
      entidad: entidad.trim() || null,
      tipo,
      limite_credito: esTarjeta ? parseMonto(limite) : null,
    }
    if (!editando) {
      cuerpo.saldo_inicial = saldo ?? 0
      cuerpo.subcuentas = esTarjeta ? [] : subcuentas
    }

    setGuardando(true)
    try {
      await onGuardar(cuerpo)
    } catch (falla) {
      setErrorGeneral(falla.message)
      setGuardando(false)
    }
  }

  const tipoCambiado = editando && tipo !== cuenta.tipo
  const etiquetaSaldo = esTarjeta ? 'Deuda actual' : 'Saldo inicial'

  return (
    <TarjetaFormulario onSubmit={enviar}>
      <Campo id="nombre" etiqueta="Nombre de la cuenta" error={errores.nombre}>
        <InputTexto
          id="nombre"
          valor={nombre}
          onChange={alCambiar('nombre', setNombre)}
          placeholder="Ej. Cuenta de ahorros principal"
          error={errores.nombre}
          maxLength={100}
          autoFocus={!editando}
        />
      </Campo>

      <Campo id="banco" etiqueta="Banco" opcional>
        <InputTexto id="banco" valor={entidad} onChange={setEntidad} placeholder="Ej. Banco General" maxLength={100} />
      </Campo>

      <Segmentado etiqueta="Tipo de cuenta" opciones={TIPOS_CUENTA} valor={tipo} onChange={setTipo} />

      {editando ? (
        <div>
          <p className="field__label">Saldo actual</p>
          <div className="readonly-box num">{dinero(cuenta.saldo)}</div>
          <p className="field__help">
            {tipoCambiado
              ? 'Al cambiar el tipo cambia cómo se interpreta este saldo: en una tarjeta es deuda y en las demás es dinero disponible.'
              : 'Se actualiza automáticamente con tus movimientos y transferencias.'}
          </p>
        </div>
      ) : (
        <Campo
          id="saldo"
          etiqueta={etiquetaSaldo}
          opcional
          error={errores.saldo}
          ayuda={
            esTarjeta
              ? 'Lo que debes hoy en esta tarjeta. Un valor negativo es saldo a favor. Se registra como una transacción.'
              : 'Se registra como una transacción de saldo inicial. Déjalo vacío si empieza en cero.'
          }
        >
          <InputMonto id="saldo" valor={saldoInicial} onChange={alCambiar('saldo', setSaldoInicial)} error={errores.saldo} />
        </Campo>
      )}

      {esTarjeta && (
        <Campo id="limite" etiqueta="Límite de crédito" error={errores.limite}>
          <InputMonto id="limite" valor={limite} onChange={alCambiar('limite', setLimite)} error={errores.limite} />
        </Campo>
      )}

      {!esTarjeta && !editando && (
        <SubcuentasIniciales
          subcuentas={subcuentas}
          saldo={Number.isNaN(saldo) ? 0 : saldo ?? 0}
          onAgregar={(sub) => setSubcuentas([...subcuentas, sub])}
          onQuitar={(indice) => setSubcuentas(subcuentas.filter((_, i) => i !== indice))}
        />
      )}

      {!esTarjeta && editando && cuenta.tipo !== TARJETA && (
        <SubcuentasExistentes cuenta={cuenta} onEliminarSubcuenta={onEliminarSubcuenta} />
      )}

      <ErrorFormulario mensaje={errorGeneral} />

      <AccionesFormulario
        izquierda={
          editando && (
            <button type="button" className="link-danger" onClick={onEliminar}>
              Eliminar cuenta
            </button>
          )
        }
      >
        <Link to="/cuentas" className="btn">
          Cancelar
        </Link>
        <button type="submit" className="btn btn--primary" disabled={guardando}>
          {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear cuenta'}
        </button>
      </AccionesFormulario>
    </TarjetaFormulario>
  )
}
