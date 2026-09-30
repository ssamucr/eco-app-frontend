import { useEffect, useRef } from 'react'
import './ConfirmDialog.css'

// Diálogo modal nativo (<dialog>): atrapa el foco y se cierra con Esc.
export default function ConfirmDialog({
  abierto,
  titulo,
  mensaje,
  etiquetaConfirmar = 'Eliminar',
  ocupado = false,
  error,
  onConfirmar,
  onCancelar,
}) {
  const dialogo = useRef(null)

  useEffect(() => {
    const el = dialogo.current
    if (abierto && !el.open) el.showModal()
    if (!abierto && el.open) el.close()
  }, [abierto])

  return (
    <dialog
      ref={dialogo}
      className="confirm"
      aria-labelledby="confirm-titulo"
      onCancel={(evento) => {
        evento.preventDefault()
        if (!ocupado) onCancelar()
      }}
      onClick={(evento) => {
        if (evento.target === dialogo.current && !ocupado) onCancelar()
      }}
    >
      <h2 id="confirm-titulo" className="confirm__title">
        {titulo}
      </h2>
      <p className="confirm__text">{mensaje}</p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="confirm__actions">
        <button type="button" className="btn" onClick={onCancelar} disabled={ocupado} autoFocus>
          Cancelar
        </button>
        <button type="button" className="btn btn--danger" onClick={onConfirmar} disabled={ocupado}>
          {ocupado ? (etiquetaConfirmar === 'Eliminar' ? 'Eliminando…' : 'Procesando…') : etiquetaConfirmar}
        </button>
      </div>
    </dialog>
  )
}
