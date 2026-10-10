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
import { AJUSTES_FIN_SEMANA } from '../../lib/ciclos'

const DIAS = Array.from({ length: 31 }, (_, i) => i + 1)

export default function CicloConfigForm({ config, onGuardar, onEliminar }) {
  const editando = Boolean(config)
  const [nombre, setNombre] = useState(config?.nombre ?? '')
  const [dias, setDias] = useState(config?.dias ?? [])
  const [ajuste, setAjuste] = useState(config?.ajuste_fin_semana ?? 'ANTERIOR')
  const [principal, setPrincipal] = useState(config?.es_principal ?? false)
  const [activo, setActivo] = useState(config?.activo ?? true)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState(null)
  const [guardando, setGuardando] = useState(false)

  const alternarDia = (dia) => {
    setDias((previos) => (previos.includes(dia) ? previos.filter((d) => d !== dia) : [...previos, dia].sort((a, b) => a - b)))
    setErrores((previos) => ({ ...previos, dias: undefined }))
  }

  const enviar = async (evento) => {
    evento.preventDefault()
    const nuevos = {}
    if (!nombre.trim()) nuevos.nombre = 'Escribe un nombre.'
    if (dias.length === 0) nuevos.dias = 'Elige al menos un día del mes.'
    setErrores(nuevos)
    setErrorGeneral(null)
    if (Object.keys(nuevos).length) return
    setGuardando(true)
    try {
      await onGuardar({
        nombre: nombre.trim(),
        dias,
        ajuste_fin_semana: ajuste,
        es_principal: principal,
        activo,
      })
    } catch (falla) {
      setErrorGeneral(falla.message)
      setGuardando(false)
    }
  }

  const esLaPrincipal = editando && config.es_principal

  return (
    <TarjetaFormulario onSubmit={enviar}>
      <Campo id="nombre" etiqueta="Nombre" error={errores.nombre}>
        <InputTexto
          id="nombre"
          valor={nombre}
          onChange={(valor) => {
            setNombre(valor)
            setErrores((previos) => ({ ...previos, nombre: undefined }))
          }}
          placeholder="Ej. Quincena"
          error={errores.nombre}
          maxLength={30}
          autoFocus={!editando}
        />
      </Campo>

      <div>
        <p className="field__label" id="dias-etiqueta">
          Días del mes en que empieza un ciclo
        </p>
        <div className="daygrid" role="group" aria-labelledby="dias-etiqueta">
          {DIAS.map((dia) => (
            <button
              key={dia}
              type="button"
              className="daygrid__day"
              aria-pressed={dias.includes(dia)}
              aria-label={dia === 31 ? 'Día 31 (último día del mes)' : `Día ${dia}`}
              onClick={() => alternarDia(dia)}
            >
              {dia}
            </button>
          ))}
        </div>
        <p className="field__help">
          Por ejemplo 10 y 25 si cobras dos veces al mes. El 31 significa el último día de cada mes.
        </p>
        {errores.dias && (
          <p className="field__error" role="alert">
            {errores.dias}
          </p>
        )}
      </div>

      <Segmentado id="ajuste" etiqueta="Si ese día cae en fin de semana" opciones={AJUSTES_FIN_SEMANA} valor={ajuste} onChange={setAjuste} />

      <label className="switch">
        <input
          type="checkbox"
          checked={principal || esLaPrincipal}
          disabled={esLaPrincipal}
          onChange={(evento) => setPrincipal(evento.target.checked)}
        />
        <span>
          Es la configuración principal (la que usa el Resumen)
          {esLaPrincipal && ' — para cambiarla, marca otra como principal'}
        </span>
      </label>
      <label className="switch">
        <input type="checkbox" checked={activo} disabled={esLaPrincipal} onChange={(evento) => setActivo(evento.target.checked)} />
        <span>Activa</span>
      </label>

      {editando && (
        <p className="field__help">
          Si cambias los días o el ajuste, el ciclo actual y los futuros se recalculan; los ciclos pasados se conservan.
        </p>
      )}

      <ErrorFormulario mensaje={errorGeneral} />

      <AccionesFormulario
        izquierda={
          editando && (
            <button type="button" className="link-danger" onClick={onEliminar}>
              Eliminar configuración
            </button>
          )
        }
      >
        <Link to="/ciclos" className="btn">
          Cancelar
        </Link>
        <button type="submit" className="btn btn--primary" disabled={guardando}>
          {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Crear configuración'}
        </button>
      </AccionesFormulario>
    </TarjetaFormulario>
  )
}
