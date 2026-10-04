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

  const ejecutar = async (accion) => {
    setOcupado(true)
    setError(null)
    try {
      await accion()
      const alExito = pendiente.onExito
      setPendiente(null)
      alExito?.()
    } catch (falla) {
      setError(falla.message)
    } finally {
      setOcupado(false)
    }
  }

  const confirmar = () => ejecutar(pendiente.ejecutar)
  const confirmarAlterna = () => ejecutar(pendiente.ejecutarAlterna)

  return {
    pedir,
    dialogoProps: {
      abierto: Boolean(pendiente),
      titulo: pendiente?.titulo ?? '',
      mensaje: pendiente?.mensaje ?? '',
      etiquetaConfirmar: pendiente?.etiquetaConfirmar,
      etiquetaAlterna: pendiente?.etiquetaAlterna,
      alternaSiempre: Boolean(pendiente?.alternaSiempre),
      ocupado,
      error,
      onConfirmar: confirmar,
      onConfirmarAlterna: pendiente?.ejecutarAlterna ? confirmarAlterna : undefined,
      onCancelar: cancelar,
    },
  }
}
