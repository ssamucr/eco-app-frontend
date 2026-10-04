import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { sanitizarEntradaMonto } from '../lib/format'
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
        onChange={(evento) => onChange(sanitizarEntradaMonto(evento.target.value))}
        maxLength={19}
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
        onChange={(evento) => onChange(sanitizarEntradaMonto(evento.target.value, 3))}
        maxLength={6}
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

const normalizar = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

// Con más de esta cantidad de opciones aparece el buscador.
const OPCIONES_PARA_BUSCAR = 6

// Lista desplegable con buscador. opciones: [{ valor, etiqueta, detalle?, deshabilitada? }].
// `vacio` agrega una primera opción sin valor.
export function Selector({ id, valor, onChange, opciones, vacio, ayuda, error, disabled, ...resto }) {
  const [abierto, setAbierto] = useState(false)
  const [consulta, setConsulta] = useState('')
  const [activa, setActiva] = useState(0)
  const [haciaArriba, setHaciaArriba] = useState(false)
  const contenedor = useRef(null)
  const buscador = useRef(null)
  const lista = useRef(null)

  const todas = vacio !== undefined ? [{ valor: '', etiqueta: vacio, vacia: true }, ...opciones] : opciones
  const q = normalizar(consulta.trim())
  const visibles = q
    ? todas.filter((o) => !o.vacia && normalizar(`${o.etiqueta} ${o.detalle ?? ''}`).includes(q))
    : todas
  const seleccionada = todas.find((o) => String(o.valor) === String(valor))
  const conBuscador = opciones.length > OPCIONES_PARA_BUSCAR

  const abrir = () => {
    if (disabled) return
    const caja = contenedor.current.getBoundingClientRect()
    const abajo = window.innerHeight - caja.bottom
    setHaciaArriba(abajo < 300 && caja.top > abajo)
    setConsulta('')
    const indice = todas.findIndex((o) => String(o.valor) === String(valor))
    setActiva(Math.max(indice, 0))
    setAbierto(true)
  }

  const cerrar = () => setAbierto(false)

  const elegir = (opcion) => {
    if (!opcion || opcion.deshabilitada) return
    onChange(String(opcion.valor))
    cerrar()
    contenedor.current.querySelector('button').focus()
  }

  useEffect(() => {
    if (!abierto) return undefined
    if (conBuscador) buscador.current?.focus()
    const fuera = (evento) => {
      if (!contenedor.current?.contains(evento.target)) setAbierto(false)
    }
    document.addEventListener('mousedown', fuera)
    return () => document.removeEventListener('mousedown', fuera)
  }, [abierto, conBuscador])

  useEffect(() => {
    if (abierto) lista.current?.querySelector('[data-activa="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [abierto, activa])

  const alPulsar = (evento) => {
    if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
      evento.preventDefault()
      if (!abierto) return abrir()
      const paso = evento.key === 'ArrowDown' ? 1 : -1
      setActiva((actual) => Math.min(Math.max(actual + paso, 0), Math.max(visibles.length - 1, 0)))
    } else if (evento.key === 'Enter' && abierto) {
      evento.preventDefault()
      elegir(visibles[activa])
    } else if (evento.key === 'Escape' && abierto) {
      evento.preventDefault()
      evento.stopPropagation()
      cerrar()
    } else if (evento.key === 'Tab') {
      cerrar()
    }
  }

  return (
    <div className="select" ref={contenedor} onKeyDown={alPulsar}>
      <button
        type="button"
        className={`input input--select select__button ${seleccionada?.vacia || !seleccionada ? 'select__button--vacio' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        disabled={disabled}
        onClick={() => (abierto ? cerrar() : abrir())}
        {...propsAccesibles(id, ayuda, error)}
        {...resto}
      >
        {seleccionada ? seleccionada.etiqueta : vacio ?? ''}
      </button>
      {abierto && (
        <div className={`select__panel ${haciaArriba ? 'select__panel--arriba' : ''}`}>
          {conBuscador && (
            <input
              ref={buscador}
              type="search"
              className="input select__search"
              placeholder="Buscar…"
              aria-label="Buscar en la lista"
              value={consulta}
              onChange={(evento) => {
                setConsulta(evento.target.value)
                setActiva(0)
              }}
            />
          )}
          <ul ref={lista} className="select__list" role="listbox" aria-labelledby={id}>
            {visibles.length === 0 && <li className="select__empty">Sin resultados</li>}
            {visibles.map((o, i) => (
              <li
                key={`${o.valor}-${i}`}
                role="option"
                aria-selected={String(o.valor) === String(valor)}
                aria-disabled={o.deshabilitada || undefined}
                data-activa={i === activa}
                className={`select__option ${i === activa ? 'is-active' : ''} ${
                  String(o.valor) === String(valor) ? 'is-selected' : ''
                } ${o.vacia ? 'select__option--vacia' : ''}`}
                onMouseEnter={() => setActiva(i)}
                onClick={() => elegir(o)}
              >
                <span className="select__label">{o.etiqueta}</span>
                {o.detalle && <span className="select__detail">{o.detalle}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
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
