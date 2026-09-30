import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// Aviso que llega por el estado de navegación (ej. "Cuenta creada."). Se limpia para que no reaparezca al recargar.
export function useAviso() {
  const location = useLocation()
  const navigate = useNavigate()
  const [aviso, setAviso] = useState(location.state?.aviso ?? null)

  useEffect(() => {
    if (location.state?.aviso) navigate(location.pathname + location.search, { replace: true, state: null })
  }, [location, navigate])

  return [aviso, setAviso]
}
