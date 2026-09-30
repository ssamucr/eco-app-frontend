import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AccionesFormulario, Campo, ErrorFormulario, InputTexto, TarjetaFormulario } from '../../components/forms'

export default function CategoriaForm({ categoria, onGuardar, onEliminar }) {
  const editando = Boolean(categoria)
  const [nombre, setNombre] = useState(categoria?.nombre ?? '')
  const [descripcion, setDescripcion] = useState(categoria?.descripcion ?? '')
  const [error, setError] = useState(null)
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const enviar = async (evento) => {
    evento.preventDefault()
    setErrorGeneral(null)
    if (!nombre.trim()) {
      setError('Escribe el nombre de la categoría.')
      return
    }
    setGuardando(true)
    try {
      await onGuardar({ nombre: nombre.trim(), descripcion: descripcion.trim() || null })
    } catch (falla) {
      setErrorGeneral(falla.message)
      setGuardando(false)
    }
  }

  return (
    <TarjetaFormulario onSubmit={enviar}>
      <Campo id="nombre" etiqueta="Nombre de la categoría" error={error}>
        <InputTexto
          id="nombre"
          valor={nombre}
          onChange={(valor) => {
            setNombre(valor)
            setError(null)
          }}
          placeholder="Ej. Alimentación"
          error={error}
          maxLength={30}
          autoFocus={!editando}
        />
      </Campo>

      <Campo id="descripcion" etiqueta="Descripción" opcional>
        <InputTexto
          id="descripcion"
          valor={descripcion}
          onChange={setDescripcion}
          placeholder="Ej. Comida, restaurantes y supermercado"
          maxLength={50}
        />
      </Campo>

      <ErrorFormulario mensaje={errorGeneral} />

      <AccionesFormulario
        izquierda={
          editando && (
            <div>
              <button type="button" className="link-danger" onClick={onEliminar}>
                Eliminar categoría
              </button>
              <p className="form-note">Los movimientos ya registrados quedarán sin categoría.</p>
            </div>
          )
        }
      >
        <Link to="/categorias" className="btn">
          Cancelar
        </Link>
        <button type="submit" className="btn btn--primary" disabled={guardando}>
          {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear categoría'}
        </button>
      </AccionesFormulario>
    </TarjetaFormulario>
  )
}
