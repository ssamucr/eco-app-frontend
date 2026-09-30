import { useState } from 'react'

// Estado de un diálogo de confirmación que ejecuta una eliminación contra la API.
// pedir({ titulo, mensaje, ejecutar, onExito }); `dialogoProps` se pasa tal cual a <ConfirmDialog />.
export function useConfirmarEliminacion() {
  const [pendiente, setPendiente] = useState(null)
  const [ocupado, setOcupado] = useState(false)
  const [error, setError] = useState(null)

  const pedir = (configuracion) => {
    setError(null)
    setPendiente(configuracion)
  }

  const cancelar = () => {
    if (ocupado) return
    setPendiente(null)
    setError(null)
  }

  const confirmar = async () => {
    setOcupado(true)
    setError(null)
    try {
      await pendiente.ejecutar()
      const alExito = pendiente.onExito
      setPendiente(null)
      alExito?.()
    } catch (falla) {
      setError(falla.message)
    } finally {
      setOcupado(false)
    }
  }

  return {
    pedir,
    dialogoProps: {
      abierto: Boolean(pendiente),
      titulo: pendiente?.titulo ?? '',
      mensaje: pendiente?.mensaje ?? '',
      etiquetaConfirmar: pendiente?.etiquetaConfirmar,
      ocupado,
      error,
      onConfirmar: confirmar,
      onCancelar: cancelar,
    },
  }
}
