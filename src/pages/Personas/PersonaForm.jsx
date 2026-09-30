import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AccionesFormulario, Campo, ErrorFormulario, InputTexto, TarjetaFormulario } from '../../components/forms'
import { dineroConSigno, plural } from '../../lib/format'
import { estadoBalance } from '../../lib/personas'

export default function PersonaForm({ persona, onGuardar, onEliminar }) {
  const editando = Boolean(persona)
  const [nombre, setNombre] = useState(persona?.nombre ?? '')
  const [error, setError] = useState(null)
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const enviar = async (evento) => {
    evento.preventDefault()
    setErrorGeneral(null)
    if (!nombre.trim()) {
      setError('Escribe el nombre de la persona.')
      return
    }
    setGuardando(true)
    try {
      await onGuardar({ nombre: nombre.trim() })
    } catch (falla) {
      setErrorGeneral(falla.message)
      setGuardando(false)
    }
  }

  const estado = editando ? estadoBalance(persona.balance) : null

  return (
    <TarjetaFormulario onSubmit={enviar}>
      <Campo id="nombre" etiqueta="Nombre completo" error={error}>
        <InputTexto
          id="nombre"
          valor={nombre}
          onChange={(valor) => {
            setNombre(valor)
            setError(null)
          }}
          placeholder="Ej. Carlos Ruiz"
          error={error}
          maxLength={50}
          autoFocus={!editando}
        />
      </Campo>

      {editando && (
        <div>
          <p className="field__label">Balance actual</p>
          <div className="readonly-box">
            <span className={`num strong ${estado.clase}`}>{dineroConSigno(persona.balance)}</span>
            <span className="readonly-box__note">
              {estado.texto} · {plural(persona.pendientes, 'obligación pendiente', 'obligaciones pendientes')}
            </span>
          </div>
          <p className="field__help">Se calcula a partir de sus obligaciones registradas.</p>
        </div>
      )}

      <ErrorFormulario mensaje={errorGeneral} />

      <AccionesFormulario
        izquierda={
          editando && (
            <div>
              <button type="button" className="link-danger" onClick={onEliminar}>
                Eliminar persona
              </button>
              <p className="form-note">Solo si no tiene obligaciones pendientes.</p>
            </div>
          )
        }
      >
        <Link to="/personas" className="btn">
          Cancelar
        </Link>
        <button type="submit" className="btn btn--primary" disabled={guardando}>
          {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear persona'}
        </button>
      </AccionesFormulario>
    </TarjetaFormulario>
  )
}
