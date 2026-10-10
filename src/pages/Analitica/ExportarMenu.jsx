import { useEffect, useRef, useState } from 'react'
import { descargarAnalitica } from '../../api/analitica'
import Icon from '../../components/Icon'

// Botón "Exportar" con las dos opciones (Excel y PDF). `secciones` limita lo que se incluye (todo si se omite).
export default function ExportarMenu({ secciones, idCiclo, ciclos, ciclo, etiqueta = 'Exportar', chico = true }) {
  const [abierto, setAbierto] = useState(false)
  const [generando, setGenerando] = useState(null)
  const [error, setError] = useState(null)
  const contenedor = useRef(null)

  useEffect(() => {
    if (!abierto) return undefined
    const fuera = (evento) => {
      if (!contenedor.current?.contains(evento.target)) setAbierto(false)
    }
    document.addEventListener('mousedown', fuera)
    return () => document.removeEventListener('mousedown', fuera)
  }, [abierto])

  const exportar = async (formato) => {
    setGenerando(formato)
    setError(null)
    try {
      const sufijo = secciones?.length === 1 ? `-${secciones[0]}` : secciones?.length ? '-seleccion' : ''
      await descargarAnalitica(formato, idCiclo, ciclos, secciones, `eco-analitica${sufijo}-${ciclo.fecha_inicio}-${ciclo.fecha_fin}`)
      setAbierto(false)
    } catch (falla) {
      setError(falla.message)
    } finally {
      setGenerando(null)
    }
  }

  return (
    <div className="exportar" ref={contenedor}>
      <button
        type="button"
        className={`btn ${chico ? 'btn--small' : ''}`}
        aria-haspopup="menu"
        aria-expanded={abierto}
        onClick={() => setAbierto((v) => !v)}
      >
        <Icon nombre="descargar" size={14} strokeWidth={1.8} />
        {etiqueta}
      </button>
      {abierto && (
        <div className="exportar__menu" role="menu">
          <button type="button" role="menuitem" className="exportar__opcion" disabled={Boolean(generando)} onClick={() => exportar('xlsx')}>
            {generando === 'xlsx' ? 'Generando…' : 'Excel (.xlsx)'}
          </button>
          <button type="button" role="menuitem" className="exportar__opcion" disabled={Boolean(generando)} onClick={() => exportar('pdf')}>
            {generando === 'pdf' ? 'Generando…' : 'PDF'}
          </button>
          {error && <p className="exportar__error" role="alert">{error}</p>}
        </div>
      )}
    </div>
  )
}
