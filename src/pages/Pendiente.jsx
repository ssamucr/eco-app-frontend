import { useLocation } from 'react-router-dom'

export default function Pendiente() {
  const { pathname } = useLocation()
  return (
    <div>
      <h1 style={{ fontSize: 27, fontWeight: 600, letterSpacing: '-0.3px' }}>Pantalla pendiente</h1>
      <p style={{ marginTop: 5, fontSize: 14, color: 'var(--text-muted)' }}>
        <code>{pathname}</code> todavía no está construida.
      </p>
    </div>
  )
}
