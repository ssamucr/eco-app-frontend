import { useEffect, useRef } from 'react'
import Icon from './Icon'

// Panel que sube desde abajo (patron de celular). Se cierra tocando fuera, con la X o con Escape.
export default function HojaInferior({ abierta, onCerrar, titulo, children }) {
  const panel = useRef(null)

  useEffect(() => {
    if (!abierta) return undefined
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const alTeclear = (evento) => {
      if (evento.key === 'Escape') onCerrar()
    }
    document.addEventListener('keydown', alTeclear)
    panel.current?.focus()
    return () => {
      document.body.style.overflow = anterior
      document.removeEventListener('keydown', alTeclear)
    }
  }, [abierta, onCerrar])

  if (!abierta) return null
  return (
    <div className="hoja">
      <button type="button" className="hoja__fondo" aria-label="Cerrar" tabIndex={-1} onClick={onCerrar} />
      <div className="hoja__panel" role="dialog" aria-modal="true" aria-label={titulo} tabIndex={-1} ref={panel}>
        <div className="hoja__cabecera">
          <span className="hoja__asa" aria-hidden="true" />
          <h2 className="hoja__titulo">{titulo}</h2>
          <button type="button" className="hoja__cerrar" aria-label="Cerrar" onClick={onCerrar}>
            <Icon nombre="cerrar" size={18} strokeWidth={2} />
          </button>
        </div>
        <div className="hoja__cuerpo">{children}</div>
      </div>
    </div>
  )
}
