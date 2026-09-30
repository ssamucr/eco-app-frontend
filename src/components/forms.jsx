import { Link } from 'react-router-dom'
import Icon from './Icon'
import './forms.css'

export function VolverA({ to, children }) {
  return (
    <Link to={to} className="backlink">
      <Icon nombre="volver" size={13} strokeWidth={2} />
      {children}
    </Link>
  )
}

// Contenedor angosto de las pantallas de formulario.
export function PaginaFormulario({ children }) {
  return <div className="form-page">{children}</div>
}

export function EncabezadoFormulario({ titulo, subtitulo }) {
  return (
    <div>
      <h1 className="form-title">{titulo}</h1>
      {subtitulo && <p className="page-subtitle">{subtitulo}</p>}
    </div>
  )
}

export function Campo({ id, etiqueta, opcional, ayuda, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="field__label">
        {etiqueta}
        {opcional && <span className="field__optional"> (opcional)</span>}
      </label>
      {children}
      {ayuda && (
        <p id={`${id}-ayuda`} className="field__help">
          {ayuda}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

function propsAccesibles(id, ayuda, error) {
  return {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': [ayuda && `${id}-ayuda`, error && `${id}-error`].filter(Boolean).join(' ') || undefined,
  }
}

export function InputTexto({ id, valor, onChange, ayuda, error, ...resto }) {
  return (
    <input
      type="text"
      className="input"
      value={valor}
      onChange={(evento) => onChange(evento.target.value)}
      {...propsAccesibles(id, ayuda, error)}
      {...resto}
    />
  )
}

export function InputMonto({ id, valor, onChange, ayuda, error, ...resto }) {
  return (
    <div className="input-money">
      <span className="input-money__symbol" aria-hidden="true">
        $
      </span>
      <input
        type="text"
        inputMode="decimal"
        placeholder="0.00"
        className="input input--money num"
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
        {...propsAccesibles(id, ayuda, error)}
        {...resto}
      />
    </div>
  )
}

export function InputPorcentaje({ id, valor, onChange, ayuda, error, ...resto }) {
  return (
    <div className="input-money">
      <input
        type="text"
        inputMode="decimal"
        className="input input--percent num"
        value={valor}
        onChange={(evento) => onChange(evento.target.value)}
        {...propsAccesibles(id, ayuda, error)}
        {...resto}
      />
      <span className="input-money__symbol input-money__symbol--right" aria-hidden="true">
        %
      </span>
    </div>
  )
}

export function InputFecha({ id, valor, onChange, ayuda, error, ...resto }) {
  return (
    <input
      type="date"
      className="input"
      value={valor}
      onChange={(evento) => onChange(evento.target.value)}
      {...propsAccesibles(id, ayuda, error)}
      {...resto}
    />
  )
}

// opciones: [{ valor, etiqueta, deshabilitada? }]. `vacio` agrega una primera opción sin valor.
export function Selector({ id, valor, onChange, opciones, vacio, ayuda, error, ...resto }) {
  return (
    <select
      className="input input--select"
      value={valor}
      onChange={(evento) => onChange(evento.target.value)}
      {...propsAccesibles(id, ayuda, error)}
      {...resto}
    >
      {vacio !== undefined && <option value="">{vacio}</option>}
      {opciones.map((opcion) => (
        <option key={opcion.valor} value={opcion.valor} disabled={opcion.deshabilitada}>
          {opcion.etiqueta}
        </option>
      ))}
    </select>
  )
}

export function Segmentado({ id = 'segmentado', etiqueta, opciones, valor, onChange }) {
  return (
    <div>
      <p className="field__label" id={`${id}-etiqueta`}>
        {etiqueta}
      </p>
      <div className="segmented" role="radiogroup" aria-labelledby={`${id}-etiqueta`}>
        {opciones.map((opcion) => (
          <button
            key={opcion.valor}
            type="button"
            role="radio"
            aria-checked={valor === opcion.valor}
            className={`segmented__option ${valor === opcion.valor ? 'is-active' : ''}`}
            onClick={() => onChange(opcion.valor)}
          >
            {opcion.etiqueta}
          </button>
        ))}
      </div>
    </div>
  )
}

export function TarjetaFormulario({ onSubmit, children }) {
  return (
    <form className="form-card" onSubmit={onSubmit} noValidate>
      {children}
    </form>
  )
}

export function AccionesFormulario({ children, izquierda }) {
  return (
    <>
      <div className="form-divider" />
      <div className={`form-actions ${izquierda ? 'form-actions--split' : ''}`}>
        {izquierda}
        <div className="form-actions__main">{children}</div>
      </div>
    </>
  )
}

export function ErrorFormulario({ mensaje }) {
  if (!mensaje) return null
  return (
    <p className="form-error" role="alert">
      {mensaje}
    </p>
  )
}
