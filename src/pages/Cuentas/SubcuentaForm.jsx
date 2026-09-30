import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AccionesFormulario,
  Campo,
  ErrorFormulario,
  InputMonto,
  InputTexto,
  TarjetaFormulario,
} from '../../components/forms'
import { dinero, montoParaInput, parseMonto } from '../../lib/format'

// Sirve para crear (subcuenta = null) y para editar una subcuenta de `cuenta`.
export default function SubcuentaForm({ cuenta, subcuenta, onGuardar, onEliminar }) {
  const editando = Boolean(subcuenta)
  const [nombre, setNombre] = useState(subcuenta?.nombre ?? '')
  const [monto, setMonto] = useState(editando ? montoParaInput(subcuenta.saldo) : '')
  const [meta, setMeta] = useState(montoParaInput(subcuenta?.saldo_meta))
  const [descripcion, setDescripcion] = useState(subcuenta?.descripcion ?? '')
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [guardando, setGuardando] = useState(false)

  // Al editar un campo se quita su error, para no dejar mensajes obsoletos.
  const alCambiar = (campo, poner) => (valor) => {
    poner(valor)
    setErrores((previos) => ({ ...previos, [campo]: undefined }))
  }

  // Lo máximo que puede quedar asignado: lo libre, más lo que esta subcuenta ya tiene.
  const maximo = cuenta.sin_asignar + (subcuenta?.saldo ?? 0)

  const validar = () => {
    const nuevos = {}
    const valor = parseMonto(monto)
    const objetivo = parseMonto(meta)
    if (!nombre.trim()) nuevos.nombre = 'Escribe un nombre para la subcuenta.'
    if (valor == null || Number.isNaN(valor) || valor < 0) nuevos.monto = 'Ingresa el monto (puede ser 0).'
    else if (valor > Math.max(maximo, 0) + 0.001) nuevos.monto = `Máximo disponible: ${dinero(Math.max(maximo, 0))}.`
    if (Number.isNaN(objetivo) || (objetivo ?? 0) < 0) nuevos.meta = 'Ingresa un monto válido.'
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
        nombre: nombre.trim(),
        saldo: parseMonto(monto),
        saldo_meta: parseMonto(meta),
        descripcion: descripcion.trim() || null,
        id_cuenta: cuenta.id_cuenta,
      })
    } catch (falla) {
      setErrorGeneral(falla.message)
      setGuardando(false)
    }
  }

  return (
    <TarjetaFormulario onSubmit={enviar}>
      <div className="info-box">
        <span className="info-box__label">Sin asignar en esta cuenta</span>
        <span className={`info-box__value num ${cuenta.sin_asignar < 0 ? 'negative' : ''}`}>
          {dinero(cuenta.sin_asignar)}
        </span>
      </div>

      <Campo id="nombre" etiqueta="Nombre de la subcuenta" error={errores.nombre}>
        <InputTexto
          id="nombre"
          valor={nombre}
          onChange={alCambiar('nombre', setNombre)}
          placeholder="Ej. Fondo de emergencia"
          error={errores.nombre}
          maxLength={100}
          autoFocus={!editando}
        />
      </Campo>

      <Campo
        id="monto"
        etiqueta={editando ? 'Monto asignado' : 'Monto a asignar'}
        error={errores.monto}
        ayuda={
          editando
            ? 'Aumentar este monto lo resta del saldo sin asignar de la cuenta.'
            : `Se resta del saldo sin asignar de ${cuenta.nombre}.`
        }
      >
        <InputMonto id="monto" valor={monto} onChange={alCambiar('monto', setMonto)} error={errores.monto} />
      </Campo>

      <Campo
        id="saldometa"
        etiqueta="Saldo meta"
        opcional
        error={errores.meta}
        ayuda="La meta de ahorro que quieres alcanzar en esta subcuenta."
      >
        <InputMonto id="saldometa" valor={meta} onChange={alCambiar('meta', setMeta)} error={errores.meta} />
      </Campo>

      <Campo id="descripcion" etiqueta="Descripción" opcional>
        <InputTexto
          id="descripcion"
          valor={descripcion}
          onChange={setDescripcion}
          placeholder="Ej. Para imprevistos médicos o de trabajo"
          maxLength={200}
        />
      </Campo>

      <ErrorFormulario mensaje={errorGeneral} />

      <AccionesFormulario
        izquierda={
          editando && (
            <button type="button" className="link-danger" onClick={onEliminar}>
              Eliminar subcuenta
            </button>
          )
        }
      >
        <Link to="/cuentas" className="btn">
          Cancelar
        </Link>
        <button type="submit" className="btn btn--primary" disabled={guardando}>
          {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear subcuenta'}
        </button>
      </AccionesFormulario>
    </TarjetaFormulario>
  )
}
