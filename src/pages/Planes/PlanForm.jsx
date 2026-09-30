import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AccionesFormulario,
  Campo,
  ErrorFormulario,
  InputTexto,
  Segmentado,
  TarjetaFormulario,
} from '../../components/forms'
import DestinosEditor from './DestinosEditor'

const ESTADOS = [
  { valor: 'si', etiqueta: 'Activo' },
  { valor: 'no', etiqueta: 'Inactivo' },
]

// Los destinos del detalle llevan el id de la base; los nuevos no.
const desdeApi = (d) => ({ ...d, clave: `id-${d.id_plan_recurrente_destino}`, id: d.id_plan_recurrente_destino })
const haciaApi = (d) => ({
  id_plan_recurrente_destino: d.id,
  id_cuenta_destino: d.id_cuenta_destino,
  id_subcuenta_destino: d.id_subcuenta_destino,
  monto: d.monto,
  porcentaje: d.porcentaje,
  activo: d.activo,
})

export default function PlanForm({ plan, opciones, onGuardar, onEliminar }) {
  const editando = Boolean(plan)
  const [nombre, setNombre] = useState(plan?.nombre ?? '')
  const [descripcion, setDescripcion] = useState(plan?.descripcion ?? '')
  const [activo, setActivo] = useState(plan ? (plan.activo ? 'si' : 'no') : 'si')
  const [destinos, setDestinos] = useState(() => (plan?.destinos ?? []).map(desdeApi))
  const [error, setError] = useState(null)
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const enviar = async (evento) => {
    evento.preventDefault()
    setErrorGeneral(null)
    if (!nombre.trim()) {
      setError('Escribe un nombre para el plan.')
      return
    }
    setGuardando(true)
    try {
      await onGuardar({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        activo: activo === 'si',
        destinos: destinos.map(haciaApi),
      })
    } catch (falla) {
      setErrorGeneral(falla.message)
      setGuardando(false)
    }
  }

  return (
    <TarjetaFormulario onSubmit={enviar}>
      <Campo id="nombre" etiqueta="Nombre" error={error}>
        <InputTexto
          id="nombre"
          valor={nombre}
          onChange={(valor) => {
            setNombre(valor)
            setError(null)
          }}
          placeholder="Ej. Ahorro programado quincenal"
          error={error}
          maxLength={50}
          autoFocus={!editando}
        />
      </Campo>

      <Campo id="descripcion" etiqueta="Descripción" opcional>
        <InputTexto
          id="descripcion"
          valor={descripcion}
          onChange={setDescripcion}
          placeholder="Ej. Al recibir el pago, asigna una parte a Fondo de emergencia y otra a Vacaciones"
          maxLength={200}
        />
      </Campo>

      <Segmentado id="plan-estado" etiqueta="Estado del plan" opciones={ESTADOS} valor={activo} onChange={setActivo} />

      <div className="form-divider" />

      <DestinosEditor opciones={opciones} destinos={destinos} onCambiar={setDestinos} />

      <ErrorFormulario mensaje={errorGeneral} />

      <AccionesFormulario
        izquierda={
          editando && (
            <button type="button" className="link-danger" onClick={onEliminar}>
              Eliminar plan
            </button>
          )
        }
      >
        <Link to={editando ? `/planes-recurrentes/${plan.id_plan}` : '/planes-recurrentes'} className="btn">
          Cancelar
        </Link>
        <button type="submit" className="btn btn--primary" disabled={guardando}>
          {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear plan'}
        </button>
      </AccionesFormulario>
    </TarjetaFormulario>
  )
}
